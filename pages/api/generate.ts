import type { NextApiRequest, NextApiResponse } from 'next'
import multer from 'multer'
import { z } from 'zod'

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
    const countSectionItems = (kind: 'top' | 'bottom' | 'shoes' | 'accessories') =>
      parsed.sections.filter((s: any) => s.kind === kind).flatMap((s: any) => s.items).length
    const sectionKinds: Array<'top' | 'bottom' | 'shoes' | 'accessories'> = ['top', 'bottom', 'shoes', 'accessories']
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

    // Placeholder response for now
    return res.status(200).json({ ok: true, mode: parsed.mode, fileCount: files.length })
  } catch (err: any) {
    if (err?.message?.includes('Invalid file type')) {
      return res.status(400).json({ error: err.message })
    }
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
