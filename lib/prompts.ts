import OpenAI from 'openai'
import type { GenerationPayload } from '@/types/GenerationPayload'

export type PromptBuildResult = { prompt: string; ordering: string[] }

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

// System prompt (inserted verbatim as required)
const SYSTEM_PROMPT = `Ты — стилист и промпт-инженер. На вход ты получаешь JSON с разделами одежды (верх, низ, обувь, аксессуары), опциональные референсы (свет/цвет/стиль), опциональный текстовый бриф, пресет-стиль и режим работы (text | refs+text | replace-on-user). 
Сконструируй:
1) Итоговый промпт для модели изображения, короткий, чёткий, без воды.
2) Секцию "Порядок подключения изображений" — массив строк, где каждая строка вида "№<n>: <что именно на этом изображении>" (например, "№1: куртка (верх)", "№2: джинсы (низ)", "№5: референс света").
3) В промпте всегда явно указывай, откуда брать каждый элемент: "куртка с изображения №1", "референс стиля с изображения №5–6" и т.п.
4) Если режим replace-on-user — в явном виде укажи "основное фото пользователя — изображение №X" и перечисли, что заменять.
Соблюдай последовательность и непротиворечивость. Если чего-то нет — не выдумывай.
Выводи JSON с ключами: { "prompt": string, "ordering": string[] }.`

export async function buildPromptFromBrief(input: GenerationPayload, knownOrdering?: string[]): Promise<PromptBuildResult> {
  const userBlocks: string[] = []
  userBlocks.push('Входные данные (JSON):')
  userBlocks.push('```json')
  userBlocks.push(JSON.stringify(input))
  userBlocks.push('```')
  if (knownOrdering && knownOrdering.length) {
    userBlocks.push('Известная нумерация изображений (если применимо):')
    userBlocks.push(knownOrdering.map((s, i) => `${s}`).join('\n'))
  }
  userBlocks.push('Выведи только JSON без лишнего текста.')

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userBlocks.join('\n\n') },
  ]

  const resp = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.2,
    messages,
    response_format: { type: 'json_object' as const },
  })

  const content = resp.choices?.[0]?.message?.content || '{}'
  try {
    const parsed = JSON.parse(content)
    if (typeof parsed.prompt === 'string' && Array.isArray(parsed.ordering)) {
      return { prompt: parsed.prompt, ordering: parsed.ordering }
    }
  } catch {}

  // Fallback: return minimal prompt using textBrief
  return {
    prompt: input.textBrief || 'Описание не задано',
    ordering: knownOrdering || [],
  }
}
