import sharp from 'sharp'

// Clamp aspect ratio into inclusive range [minRatio, maxRatio] by center-cropping.
export async function clampAspect(
  input: Buffer,
  { minRatio = 0.33, maxRatio = 3.0 }: { minRatio?: number; maxRatio?: number } = {},
): Promise<{ buffer: Buffer; changed: boolean; aspect: number }> {
  const img = sharp(input, { failOn: 'none' })
  const meta = await img.metadata()
  if (!meta.width || !meta.height) return { buffer: input, changed: false, aspect: 1 }
  const w = meta.width
  const h = meta.height
  const aspect = w / h
  if (aspect >= minRatio && aspect <= maxRatio) {
    return { buffer: input, changed: false, aspect }
  }
  // Need crop. We keep the shorter dimension and crop the longer.
  let targetW = w
  let targetH = h
  let newAspect = aspect
  if (aspect > maxRatio) {
    // too wide -> reduce width
    targetW = Math.round(maxRatio * h)
    newAspect = targetW / h
  } else if (aspect < minRatio) {
    // too tall -> reduce height
    targetH = Math.round(w / minRatio)
    newAspect = w / targetH
  }
  // Ensure limits
  if (targetW <= 0 || targetH <= 0) return { buffer: input, changed: false, aspect }
  const left = Math.max(0, Math.floor((w - targetW) / 2))
  const top = Math.max(0, Math.floor((h - targetH) / 2))
  const extractW = Math.min(targetW, w)
  const extractH = Math.min(targetH, h)
  const cropped = await img.extract({ left, top, width: extractW, height: extractH }).toFormat('png').toBuffer()
  return { buffer: cropped, changed: true, aspect: newAspect }
}
