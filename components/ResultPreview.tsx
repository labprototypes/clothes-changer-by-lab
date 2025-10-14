"use client"
import { useMemo, useState, useEffect } from 'react'
import { useGeneration } from '@/app/context/GenerationContext'

export default function ResultPreview() {
  const { state } = useGeneration()
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!state.resultBase64) {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
      setBlobUrl(null)
      return
    }
    try {
      const bin = atob(state.resultBase64)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      const blob = new Blob([bytes], { type: 'image/png' })
      const url = URL.createObjectURL(blob)
      if (blobUrl) URL.revokeObjectURL(blobUrl)
      setBlobUrl(url)
    } catch {
      // ignore
    }
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.resultBase64])

  return (
    <div>
      <div className="font-medium">Результат</div>
      {!blobUrl && <p className="help-text">Здесь отобразится превью и кнопка «Скачать».</p>}
      {blobUrl && (
        <div className="mt-2 space-y-2">
          <img src={blobUrl} alt="result" className="w-full rounded-md border" />
          <a href={blobUrl} download={`result_${Date.now()}.png`} className="inline-block px-3 py-2 rounded-md border text-sm">
            Скачать результат
          </a>
        </div>
      )}
    </div>
  )
}
