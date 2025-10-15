"use client"
import clsx from 'clsx'

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex rounded-md border bg-white p-0.5 shadow-sm">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-md transition',
              active ? 'bg-primary text-ink shadow' : 'hover:bg-ink/5'
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
