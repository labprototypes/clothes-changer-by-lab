import type { GenerationPayload, UploadItem } from '@/types/GenerationPayload'

export type OrderingDescription = string[]

export type IndexMapResult = {
  formData: FormData
  ordering: OrderingDescription
}

function describe(kind: string, hint?: string) {
  if (hint && hint.trim()) return `${hint} (${kind})`
  switch (kind) {
    case 'top':
      return `элемент (верх)`
    case 'bottom':
      return `элемент (низ)`
    case 'shoes':
      return `элемент (обувь)`
    case 'accessories':
      return `элемент (аксессуары)`
    case 'light':
      return `референс света`
    case 'color':
      return `референс цвета`
    case 'style':
      return `референс стиля`
    case 'user':
      return `фото пользователя`
    default:
      return `изображение`
  }
}

function pushItems(
  form: FormData,
  list: UploadItem[] | undefined,
  ns: string,
  kind: string,
  startIndex: number,
  out: string[],
): number {
  let idx = startIndex
  if (!list || list.length === 0) return idx
  list
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .forEach((item, i) => {
      if (!item.file) return
      const field = `${ns}[${i}]`
      form.append(field, item.file, (item as any).file?.name || `file_${idx}.png`)
      out.push(`№${idx}: ${describe(kind, item.comment)}`)
      idx += 1
    })
  return idx
}

export function buildFormDataAndOrdering(payload: GenerationPayload): IndexMapResult {
  const form = new FormData()
  const out: string[] = []
  let counter = 1

  // Sections: top -> bottom -> shoes -> accessories
  for (const s of payload.sections || []) {
    counter = pushItems(form, s.items, `files[${s.kind}]`, s.kind, counter, out)
  }

  // Refs: light -> color -> style
  if (payload.refs) {
    counter = pushItems(form, payload.refs.light?.items, `files[refs][light]`, 'light', counter, out)
    counter = pushItems(form, payload.refs.color?.items, `files[refs][color]`, 'color', counter, out)
    counter = pushItems(form, payload.refs.style?.items, `files[refs][style]`, 'style', counter, out)
  }

  // User images
  if (payload.userImages) {
    counter = pushItems(form, payload.userImages.items, `files[user]`, 'user', counter, out)
  }

  // Attach JSON payload
  form.append('json', JSON.stringify(payload))

  return { formData: form, ordering: out }
}
