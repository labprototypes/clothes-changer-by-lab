"use client"
import { useCallback } from 'react'
import { useGeneration } from '@/app/context/GenerationContext'
import { buildFormDataAndOrdering } from '@/lib/indexMap'
import type { GenerationPayload } from '@/types/GenerationPayload'

export default function GenerateButton() {
  const { state, dispatch } = useGeneration()

  const handleGenerate = useCallback(async () => {
    dispatch({ type: 'setError', message: null })
    dispatch({ type: 'setResult', base64: null })

    // quick client-side validations
    if (state.mode === 'replace-on-user' && state.userImages.items.length < 1) {
      dispatch({ type: 'setError', message: 'Для режима замены требуется хотя бы одно фото пользователя' })
      return
    }

    dispatch({ type: 'setLoading', value: true })
    try {
      // Auto-format fallback: if aspectRatio = match_input_image but нет user image -> force 1:1
      const hasUser = state.userImages.items.length > 0
      const opt = { ...(state.options || {}) }
      if (opt.aspectRatio === 'match_input_image' && !hasUser) {
        opt.aspectRatio = '1:1'
      }
      const payload: GenerationPayload = {
        mode: state.mode,
        textBrief: state.textBrief,
        sections: state.sections,
        refs: state.refs,
        userImages: state.userImages,
        options: opt,
      }

      const { formData } = buildFormDataAndOrdering(payload)

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data?.error || `Ошибка генерации (${res.status})`
        dispatch({ type: 'setError', message: msg })
        return
      }

      const data = await res.json()
      if (data?.imageBase64) {
        dispatch({ type: 'setResult', base64: data.imageBase64 })
      } else {
        dispatch({ type: 'setError', message: 'Пустой ответ от сервера' })
      }
    } catch (e: any) {
      dispatch({ type: 'setError', message: e?.message || 'Не удалось выполнить запрос' })
    } finally {
      dispatch({ type: 'setLoading', value: false })
    }
  }, [state, dispatch])

  return (
    <div>
      <button
        className="px-3 py-2 rounded-md bg-primary text-ink font-medium disabled:opacity-60"
        onClick={handleGenerate}
        disabled={state.loading}
      >
        {state.loading ? 'Генерация…' : 'Сгенерировать'}
      </button>
      {state.error && <div className="mt-2 text-xs text-red-600">{state.error}</div>}
      <p className="help-text mt-2">Отправляет данные на /api/generate и показывает прогресс.</p>
    </div>
  )
}
