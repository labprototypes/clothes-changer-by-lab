import Replicate from 'replicate'

export type RunOptions = {
  prompt: string
  images: Buffer[] // ordered
  options?: {
    seed?: number | null
    quality?: 'standard' | 'high'
    size?: '1K' | '2K' | '4K' | 'custom'
    width?: number
    height?: number
    aspect_ratio?: string
    max_images?: number
    sequential_image_generation?: 'disabled' | 'auto'
  }
  signal?: AbortSignal
}

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

const MODEL = process.env.CDREAM_MODEL || 'owner/cdream-4'
const VERSION = process.env.CDREAM_VERSION // optional

// Adapt inputs to C-Dream/Seedream-like schema
function buildModelInput(opts: RunOptions) {
  // Many image models accept an array under `image_input` or similar
  // Replicate SDK accepts Buffers directly.
  const input: Record<string, any> = {
    prompt: opts.prompt,
    image_input: opts.images, // Seedream-4 uses image_input
    aspect_ratio: opts.options?.aspect_ratio ?? 'match_input_image',
    sequential_image_generation: opts.options?.sequential_image_generation ?? 'disabled',
  }

  if (opts.options?.size) input.size = opts.options.size
  if (opts.options?.width) input.width = opts.options.width
  if (opts.options?.height) input.height = opts.options.height
  if (opts.options?.max_images) input.max_images = opts.options.max_images
  if (opts.options?.seed !== undefined && opts.options?.seed !== null) input.seed = opts.options.seed

  return input
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function runCDream(opts: RunOptions): Promise<Buffer> {
  const input = buildModelInput(opts)
  const modelRef = (VERSION ? `${MODEL}:${VERSION}` : MODEL) as `${string}/${string}` | `${string}/${string}:${string}`
  const maxAttempts = 3
  let attempt = 0
  let lastError: any

  while (attempt < maxAttempts) {
    try {
      const output = (await replicate.run(modelRef, { input, signal: opts.signal })) as any

      // Expect an array of file-like objects (URIs) or buffers; SDK returns URLs for delivery.
      // We'll fetch the first as ArrayBuffer via SDK typed items if available.
      if (Array.isArray(output) && output.length > 0) {
        const first = output[0]
        if (first?.buffer) {
          return Buffer.from(first.buffer)
        }
        if (typeof first?.url === 'function') {
          const url = first.url()
          const res = await fetch(url)
          const ab = await res.arrayBuffer()
          return Buffer.from(ab)
        }
        if (typeof first === 'string') {
          const res = await fetch(first)
          const ab = await res.arrayBuffer()
          return Buffer.from(ab)
        }
      }
      // Some models may return a single object
      if (output?.url) {
        const res = await fetch(output.url)
        const ab = await res.arrayBuffer()
        return Buffer.from(ab)
      }
      throw new Error('Unexpected Replicate output format')
    } catch (err: any) {
      lastError = err
      attempt += 1
      if (attempt >= maxAttempts) break
      const backoff = 500 * Math.pow(2, attempt)
      await sleep(backoff)
    }
  }

  throw lastError || new Error('Replicate run failed')
}
