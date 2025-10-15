"use client"
import clsx from 'clsx'

export type Step = {
  id: string
  label: string
  badge?: string | number
  status?: 'done' | 'current' | 'error'
}

export default function Stepper({ steps, current, onChange }: { steps: Step[]; current: string; onChange: (id: string) => void }) {
  return (
    <nav aria-label="Шаги" className="space-y-1">
      {steps.map((s, idx) => {
        const isCurrent = s.id === current
        const hasError = s.status === 'error'
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={clsx(
              'w-full flex items-center justify-between rounded-md px-3 py-2 text-left transition',
              isCurrent ? 'bg-primary/10 text-primary ring-1 ring-primary/30' : 'hover:bg-ink/5',
              hasError && 'ring-1 ring-red-400/60'
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  'w-6 h-6 shrink-0 rounded-full grid place-items-center text-[11px] font-medium',
                  isCurrent ? 'bg-primary text-ink' : 'bg-ink/10 text-ink'
                )}
              >
                {idx + 1}
              </div>
              <span className="text-sm font-medium">{s.label}</span>
            </div>
            {s.badge !== undefined && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-ink/10 px-2 py-0.5 text-[10px]">
                {s.badge}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
