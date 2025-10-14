// Lightweight UUID v4 generator (browser-safe) to avoid extra types
function uuid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as any).randomUUID()
  // Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
import { useReducer, useMemo, useEffect } from 'react'
import type { GenerationPayload, Mode, RefsBlock, Section, UploadItem, UserImages } from '@/types/GenerationPayload'

export type GenerationState = Omit<GenerationPayload, 'sections' | 'refs' | 'userImages' | 'presetStyle'> & {
  sections: Section[]
  refs: RefsBlock
  userImages: UserImages
  loading: boolean
  error: string | null
  resultBase64: string | null
}

type Action =
  | { type: 'setMode'; mode: Mode }
  // preset removed
  | { type: 'setOption'; key: keyof NonNullable<GenerationPayload['options']>; value: boolean | number | string | null }
  | { type: 'setBrief'; text: string }
  | { type: 'addSectionFiles'; kind: 'face' | 'top' | 'bottom' | 'shoes' | 'accessories'; files: File[] }
  | { type: 'removeSectionItem'; kind: 'face' | 'top' | 'bottom' | 'shoes' | 'accessories'; index: number }
  | { type: 'setSectionComment'; kind: 'face' | 'top' | 'bottom' | 'shoes' | 'accessories'; text: string }
  | { type: 'setItemComment'; area: 'section' | 'ref' | 'user'; kind?: 'top' | 'bottom' | 'shoes' | 'accessories' | 'light' | 'color' | 'style'; index: number; text: string }
  | { type: 'addRefFiles'; refKind: 'light' | 'color' | 'style'; files: File[] }
  | { type: 'removeRefItem'; refKind: 'light' | 'color' | 'style'; index: number }
  | { type: 'setRefComment'; refKind: 'light' | 'color' | 'style'; text: string }
  | { type: 'addUserFiles'; files: File[] }
  | { type: 'removeUserItem'; index: number }
  | { type: 'setUserComment'; text: string }
  | { type: 'setLoading'; value: boolean }
  | { type: 'setError'; message: string | null }
  | { type: 'setResult'; base64: string | null }
  | { type: 'clearAll' }

const emptyUploadItem = (file: File, displayOrder: number): UploadItem => ({ id: uuid(), file, displayOrder, comment: '' })

const initialState: GenerationState = {
  mode: 'text',
  // presetStyle removed
  textBrief: '',
  sections: [
    { kind: 'face', items: [], sectionComment: '' },
    { kind: 'top', items: [], sectionComment: '' },
    { kind: 'bottom', items: [], sectionComment: '' },
    { kind: 'shoes', items: [], sectionComment: '' },
    { kind: 'accessories', items: [], sectionComment: '' },
  ],
  refs: { light: { items: [], comment: '' }, color: { items: [], comment: '' }, style: { items: [], comment: '' } },
  userImages: { items: [], comment: '' },
  options: { keepBackground: false, redrawBackground: false, highDetail: true, seed: null, size: '2K', aspectRatio: 'match_input_image' },
  loading: false,
  error: null,
  resultBase64: null,
}

function reducer(state: GenerationState, action: Action): GenerationState {
  switch (action.type) {
    case 'setMode':
      return { ...state, mode: action.mode }
  // preset removed
    case 'setOption':
      return { ...state, options: { ...state.options, [action.key]: action.value as any } }
    case 'setBrief':
      return { ...state, textBrief: action.text }
    case 'addSectionFiles': {
      const sections = state.sections.map((s) => {
        if (s.kind !== action.kind) return s
        const next = [...s.items]
        const start = next.length
        for (let i = 0; i < action.files.length; i++) next.push(emptyUploadItem(action.files[i], start + i))
        return { ...s, items: next }
      }) as Section[]
      return { ...state, sections }
    }
    case 'removeSectionItem': {
      const sections = state.sections.map((s) => {
        if (s.kind !== action.kind) return s
        const next = [...s.items]
        next.splice(action.index, 1)
        // reindex displayOrder
        next.forEach((it, i) => (it.displayOrder = i))
        return { ...s, items: next }
      }) as Section[]
      return { ...state, sections }
    }
    case 'setSectionComment': {
      const sections = state.sections.map((s) => (s.kind === action.kind ? { ...s, sectionComment: action.text } : s)) as Section[]
      return { ...state, sections }
    }
    case 'setItemComment': {
      if (
        action.area === 'section' &&
        ['face', 'top', 'bottom', 'shoes', 'accessories'].includes(action.kind as any)
      ) {
        const sections = state.sections.map((s) => {
          if (s.kind !== action.kind) return s
          const items = s.items.map((it, i) => (i === action.index ? { ...it, comment: action.text } : it))
          return { ...s, items }
        }) as Section[]
        return { ...state, sections }
      }
      if (action.area === 'ref' && (action.kind === 'light' || action.kind === 'color' || action.kind === 'style')) {
        const block = state.refs[action.kind]
        const items = (block?.items || []).map((it, i) => (i === action.index ? { ...it, comment: action.text } : it))
        return { ...state, refs: { ...state.refs, [action.kind]: { ...(block || { items: [] }), items } } }
      }
      if (action.area === 'user') {
        const items = state.userImages.items.map((it, i) => (i === action.index ? { ...it, comment: action.text } : it))
        return { ...state, userImages: { ...state.userImages, items } }
      }
      return state
    }
    case 'addRefFiles': {
      const block = state.refs[action.refKind] || { items: [], comment: '' }
      const next = [...block.items]
      const start = next.length
      for (let i = 0; i < action.files.length; i++) next.push(emptyUploadItem(action.files[i], start + i))
      return { ...state, refs: { ...state.refs, [action.refKind]: { ...block, items: next } } }
    }
    case 'removeRefItem': {
      const block = state.refs[action.refKind] || { items: [], comment: '' }
      const next = [...block.items]
      next.splice(action.index, 1)
      next.forEach((it, i) => (it.displayOrder = i))
      return { ...state, refs: { ...state.refs, [action.refKind]: { ...block, items: next } } }
    }
    case 'setRefComment': {
      const block = state.refs[action.refKind] || { items: [], comment: '' }
      return { ...state, refs: { ...state.refs, [action.refKind]: { ...block, comment: action.text } } }
    }
    case 'addUserFiles': {
      const next = [...state.userImages.items]
      const start = next.length
      for (let i = 0; i < action.files.length; i++) next.push(emptyUploadItem(action.files[i], start + i))
  // Auto-switch mode when user image present
  const mode = next.length > 0 ? 'replace-on-user' : state.mode
  return { ...state, mode, userImages: { ...state.userImages, items: next } }
    }
    case 'removeUserItem': {
      const next = [...state.userImages.items]
      next.splice(action.index, 1)
      next.forEach((it, i) => (it.displayOrder = i))
      return { ...state, userImages: { ...state.userImages, items: next } }
    }
    case 'setUserComment': {
      return { ...state, userImages: { ...state.userImages, comment: action.text } }
    }
    case 'setLoading':
      return { ...state, loading: action.value }
    case 'setError':
      return { ...state, error: action.message }
    case 'setResult':
      return { ...state, resultBase64: action.base64 }
    case 'clearAll':
      return { ...initialState }
    default:
      return state
  }
}

export function useGenerationReducer() {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Auto-size removed: user selects size manually

  // Compute global numbering consistent with backend order
  const orderingMap = useMemo(() => {
    const map = new Map<string, number>()
    let n = 1
    const byOrder = (a: UploadItem, b: UploadItem) => a.displayOrder - b.displayOrder

  const sec = state.sections
  for (const k of ['face', 'top', 'bottom', 'shoes', 'accessories'] as const) {
      const s = sec.find((x) => x.kind === k)
      s?.items.slice().sort(byOrder).forEach((it) => map.set(it.id, n++))
    }
    state.refs.light?.items.slice().sort(byOrder).forEach((it) => map.set(it.id, n++))
    state.refs.color?.items.slice().sort(byOrder).forEach((it) => map.set(it.id, n++))
    state.refs.style?.items.slice().sort(byOrder).forEach((it) => map.set(it.id, n++))
    state.userImages.items.slice().sort(byOrder).forEach((it) => map.set(it.id, n++))

    return map
  }, [state.sections, state.refs, state.userImages])

  return { state, dispatch, orderingMap }
}
