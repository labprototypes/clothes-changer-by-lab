import type { NextApiRequest, NextApiResponse } from 'next'
import multer from 'multer'
import { z } from 'zod'
import { buildPromptFromBrief } from '@/lib/prompts'
import { buildCDreamPrompt } from '@/lib/cdreamPrompt'
import { runCDream } from '@/lib/replicate'

// Disable Next.js body parsing (we use multer)
export const config = {
  api: {
    bodyParser: false,
  },
}

const MAX_FILE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_MB || 15)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_MB * 1024 * 1024,
    files: 50, // safety cap
  },
  fileFilter: (_req, file, cb) => {
    // Basic MIME whitelist: images only
    if (/^image\/(png|jpe?g|webp|gif|bmp|tiff)$/i.test(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'))
    }
  },
})

// Promisify multer.any() to await in route
const anyFiles = upload.any()
function runMiddleware(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  return new Promise((resolve, reject) => {
    anyFiles(req as any, res as any, (result: unknown) => {
      if (result instanceof Error) return reject(result)
      resolve()
    })
  })
}

const UploadItemSchema = z.object({
  id: z.string().min(1),
  comment: z.string().max(2000).optional().default(''),
  displayOrder: z.number().int().nonnegative(),
})

const SectionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('face'), items: z.array(UploadItemSchema), sectionComment: z.string().optional() }),
  z.object({ kind: z.literal('top'), items: z.array(UploadItemSchema), sectionComment: z.string().optional() }),
  z.object({ kind: z.literal('bottom'), items: z.array(UploadItemSchema), sectionComment: z.string().optional() }),
  z.object({ kind: z.literal('shoes'), items: z.array(UploadItemSchema), sectionComment: z.string().optional() }),
  z.object({ kind: z.literal('accessories'), items: z.array(UploadItemSchema), sectionComment: z.string().optional() }),
])

const RefsBlockSchema = z.object({
  light: z.object({ items: z.array(UploadItemSchema), comment: z.string().optional() }).optional(),
  color: z.object({ items: z.array(UploadItemSchema), comment: z.string().optional() }).optional(),
  style: z.object({ items: z.array(UploadItemSchema), comment: z.string().optional() }).optional(),
})

const UserImagesSchema = z.object({ items: z.array(UploadItemSchema), comment: z.string().optional() })

const JsonSchema = z.object({
  mode: z.enum(['text', 'refs+text', 'replace-on-user']),
  presetStyle: z.enum(['street', 'classic', 'minimal', 'sport', 'none']).optional(),
  textBrief: z.string().max(5000).optional(),
  sections: z.array(SectionSchema).default([]),
  refs: RefsBlockSchema.optional(),
  userImages: UserImagesSchema.optional(),
  options: z
    .object({
      keepBackground: z.boolean().optional(),
      redrawBackground: z.boolean().optional(),
      highDetail: z.boolean().optional(),
      seed: z.number().int().nullable().optional(),
    })
    .optional(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    await runMiddleware(req, res)

    // Multer put parsed files on req.files and text fields on req.body
    const jsonField = (req.body?.json ?? '').toString()
    if (!jsonField) {
      return res.status(400).json({ error: 'Missing required field: json' })
    }

    let parsed
    try {
      parsed = JsonSchema.parse(JSON.parse(jsonField))
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON in field "json"' })
    }

    const files = ((req as any).files as any[]) || []
    if (files.length > 50) {
      return res.status(422).json({ error: 'Too many files in request' })
    }

    // Per-block limits
    const MAX_ITEMS_PER_BLOCK = 10
  const countSectionItems = (kind: 'face' | 'top' | 'bottom' | 'shoes' | 'accessories') =>
      parsed.sections.filter((s: any) => s.kind === kind).flatMap((s: any) => s.items).length
  const sectionKinds: Array<'face' | 'top' | 'bottom' | 'shoes' | 'accessories'> = ['face', 'top', 'bottom', 'shoes', 'accessories']
    for (const k of sectionKinds) {
      if (countSectionItems(k) > MAX_ITEMS_PER_BLOCK) {
        return res.status(400).json({ error: `Too many items in section ${k}. Max ${MAX_ITEMS_PER_BLOCK}` })
      }
    }
    const refs = parsed.refs || {}
    for (const r of ['light', 'color', 'style'] as const) {
      const itemsLen = refs[r]?.items?.length || 0
      if (itemsLen > MAX_ITEMS_PER_BLOCK) {
        return res.status(400).json({ error: `Too many items in refs ${r}. Max ${MAX_ITEMS_PER_BLOCK}` })
      }
    }
    const userCount = parsed.userImages?.items?.length || 0
    if (parsed.mode === 'replace-on-user') {
      if (userCount < 1) {
        return res.status(400).json({ error: 'User image is required for mode replace-on-user' })
      }
      if (userCount > 3) {
        return res.status(400).json({ error: 'Too many user images. Max 3' })
      }
    } else {
      if (userCount > 3) {
        return res.status(400).json({ error: 'Too many user images. Max 3' })
      }
    }

    // Expected files count based on JSON (each UploadItem corresponds to one file)
    const expectedFiles =
      parsed.sections.reduce((acc: number, s: any) => acc + (s.items?.length || 0), 0) +
      (refs.light?.items?.length || 0) +
      (refs.color?.items?.length || 0) +
      (refs.style?.items?.length || 0) +
      (parsed.userImages?.items?.length || 0)

    if (files.length !== expectedFiles) {
      return res.status(422).json({
        error: 'Files count mismatch',
        details: { expected: expectedFiles, received: files.length },
      })
    }

    // Build a map: fieldname -> file buffer
    const fileMap = new Map<string, Express.Multer.File>()
    for (const f of files as Express.Multer.File[]) {
      fileMap.set((f as any).fieldname, f)
    }

    // Helper to resolve field -> buffer or 422
    const take = (field: string): Buffer => {
      const f = fileMap.get(field)
      if (!f) {
        throw Object.assign(new Error(`Missing file for field ${field}`), { status: 422 })
      }
      return f.buffer
    }

    // Construct ordered images and human-readable ordering
    const images: Buffer[] = []
    const ordering: string[] = []
    const describe = (kind: string, hint?: string) => {
      const clean = (hint || '').trim()
      if (clean) return `${clean} (${kind})`
      switch (kind) {
        case 'top':
          return 'элемент (верх)'
        case 'bottom':
          return 'элемент (низ)'
        case 'shoes':
          return 'элемент (обувь)'
        case 'accessories':
          return 'элемент (аксессуары)'
        case 'light':
          return 'референс света'
        case 'color':
          return 'референс цвета'
        case 'style':
          return 'референс стиля'
        case 'user':
          return 'фото пользователя'
        default:
          return 'изображение'
      }
    }

    let counter = 1
    for (const s of parsed.sections || []) {
      const sorted = (s.items || []).slice().sort((a: any, b: any) => a.displayOrder - b.displayOrder)
      for (let i = 0; i < sorted.length; i++) {
        const buf = take(`files[${s.kind}][${i}]`)
        images.push(buf)
        ordering.push(`№${counter}: ${describe(s.kind, sorted[i]?.comment)}`)
        counter++
      }
    }
    const refsBlock = parsed.refs || {}
    for (const rk of ['light', 'color', 'style'] as const) {
      const arr = refsBlock[rk]?.items || []
      for (let i = 0; i < arr.length; i++) {
        const buf = take(`files[refs][${rk}][${i}]`)
        images.push(buf)
        ordering.push(`№${counter}: ${describe(rk, arr[i]?.comment)}`)
        counter++
      }
    }
    const userArr = parsed.userImages?.items || []
    for (let i = 0; i < userArr.length; i++) {
      const buf = take(`files[user][${i}]`)
      images.push(buf)
      ordering.push(`№${counter}: ${describe('user', userArr[i]?.comment)}`)
      counter++
    }

    // OpenAI brief stabilization
  const { prompt: briefPrompt } = await buildPromptFromBrief(parsed as any, ordering)
    const finalPrompt = buildCDreamPrompt({ basePrompt: briefPrompt, payload: parsed, ordering })

    // Replicate call with timeout
    const controller = new AbortController()
    const REPLICATE_TIMEOUT_MS = 120_000
    const t = setTimeout(() => controller.abort('timeout'), REPLICATE_TIMEOUT_MS)
    let resultBuffer: Buffer
    try {
      resultBuffer = await runCDream({
        prompt: finalPrompt,
        images,
        options: {
          seed: parsed.options?.seed ?? null,
          aspect_ratio: 'match_input_image',
          sequential_image_generation: 'disabled',
        },
        signal: controller.signal,
      })
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message === 'timeout') {
        return res.status(504).json({ error: 'Replicate timeout' })
      }
      return res.status(502).json({ error: 'Replicate failed' })
    } finally {
      clearTimeout(t)
    }

    // Encode base64 and respond
    const imageBase64 = resultBuffer.toString('base64')

    // Best-effort cleanup of buffers for memory safety
    for (const f of files as Express.Multer.File[]) {
      try { (f as any).buffer = Buffer.alloc(0) } catch {}
    }
    resultBuffer = Buffer.alloc(0)

    return res.status(200).json({ imageBase64 })
  } catch (err: any) {
    if (err?.message?.includes('Invalid file type')) {
      return res.status(400).json({ error: err.message })
    }
    if (err?.status === 422) {
      return res.status(422).json({ error: err.message })
    }
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
