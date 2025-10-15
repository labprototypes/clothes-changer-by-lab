"use client"
import UploadCard from './UploadCard'

export default function UploadGrid({
  items,
  onComment,
  onRemove,
  ordering,
}: {
  items: Array<{ id: string; file?: File | null; comment?: string }>
  ordering: Map<string, number>
  onComment: (index: number, text: string) => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
      {items.map((it, i) => (
        <UploadCard
          key={it.id}
          indexLabel={`№${ordering.get(it.id)}`}
          previewUrl={it.file ? URL.createObjectURL(it.file) : undefined}
          comment={it.comment}
          onComment={(v) => onComment(i, v)}
          onRemove={() => onRemove(i)}
        />
      ))}
    </div>
  )
}
