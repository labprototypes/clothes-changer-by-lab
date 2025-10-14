import type { PromptInputPayload } from '@/types/GenerationPayload'

export type CDreamPromptInput = {
  basePrompt: string
  payload: PromptInputPayload
  ordering?: string[]
}

export function buildCDreamPrompt({ basePrompt, payload, ordering }: CDreamPromptInput): string {
  const parts: string[] = [basePrompt.trim()]

  if (payload.presetStyle && payload.presetStyle !== 'none') {
    parts.push(`Стиль: ${payload.presetStyle}.`)
  }

  const flags: string[] = []
  if (payload.options?.keepBackground) flags.push('сохранить фон')
  if (payload.options?.redrawBackground) flags.push('перерисовать фон')
  if (payload.options?.highDetail) flags.push('высокая детальность')
  if (payload.options?.seed !== undefined && payload.options?.seed !== null) flags.push(`seed=${payload.options.seed}`)
  if (flags.length) parts.push(`Опции: ${flags.join(', ')}.`)

  // Always enforce explicit ordering instruction
  const count = ordering?.length ?? undefined
  if (count && count > 0) {
    parts.push('Подключать изображения строго по порядку: ' + ordering!.map((_, i) => `№${i + 1}`).join(', ') + '…')
  } else {
    parts.push('Подключать изображения строго по порядку: №1, №2, №3…')
  }

  return parts.join(' ')
}
