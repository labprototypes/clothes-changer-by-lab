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

const JsonSchema = z.object({
  mode: z.enum(['text', 'refs+text', 'replace-on-user']),
}).passthrough()

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
    // Quick sanity check: no more than 50 files and at least 0
    if (files.length > 50) {
      return res.status(422).json({ error: 'Too many files in request' })
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
