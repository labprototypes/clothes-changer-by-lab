"use client"
import clsx from 'clsx'

export default function UploadCard({
  indexLabel,
  previewUrl,
  comment,
  onComment,
  onRemove,
}: {
  indexLabel: string
  previewUrl?: string
  comment?: string
  onComment: (v: string) => void
  onRemove: () => void
}) {
  return (
    <div className="relative rounded-lg border bg-white shadow-sm overflow-hidden">
      <div className="absolute left-2 top-2 z-10 inline-flex items-center rounded-full bg-ink/80 text-ink px-2 py-0.5 text-[10px]">
        {indexLabel}
      </div>
      <div className={clsx('aspect-square bg-gray-100 overflow-hidden')}>{previewUrl && <img src={previewUrl} alt="" className="w-full h-full object-cover" />}</div>
      <div className="p-2 space-y-2">
        <input
          className="w-full text-sm border rounded px-2 py-1"
          placeholder="Комментарий"
          value={comment || ''}
          onChange={(e) => onComment(e.target.value)}
        />
        <div className="flex justify-end">
          <button type="button" className="text-xs text-red-600" onClick={onRemove}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}
