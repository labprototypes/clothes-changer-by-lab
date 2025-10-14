"use client"
import { useCallback, useRef, useState } from 'react'

type Props = {
  label: string
  multiple?: boolean
  accept?: string
  maxMb?: number
  onFiles: (files: File[]) => void
}

export default function UploadZone({ label, multiple = true, accept = 'image/*', maxMb = Number(process.env.NEXT_PUBLIC_MAX_FILE_MB || 15), onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = (files: File[]) => {
    const maxBytes = maxMb * 1024 * 1024
    const valid: File[] = []
    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        setError('Допустимы только изображения')
        continue
      }
      if (f.size > maxBytes) {
        setError(`Файл слишком большой (>${maxMb} MB): ${f.name}`)
        continue
      }
      valid.push(f)
    }
    if (valid.length) setError(null)
    return valid
  }

  const pick = useCallback(() => inputRef.current?.click(), [])
  const onInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const valid = validate(files)
    if (valid.length) onFiles(valid)
    e.target.value = ''
  }, [onFiles])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files || [])
    const valid = validate(files)
    if (valid.length) onFiles(valid)
  }, [onFiles])

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`rounded-lg border-2 border-dashed p-4 text-sm cursor-pointer ${dragOver ? 'bg-gray-50 border-gray-400' : 'border-gray-200'}`}
      onClick={pick}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-700">{label}</span>
        <button type="button" className="px-2 py-1 rounded-md bg-primary text-ink text-xs font-medium">Выбрать</button>
      </div>
      <div className="help-text mt-1">Drag’n’drop или клик. До {maxMb}MB, только изображения.</div>
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
      <input ref={inputRef} type="file" hidden multiple={multiple} accept={accept} onChange={onInput} />
    </div>
  )
}
