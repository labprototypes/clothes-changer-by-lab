"use client"
import { ReactNode, useMemo, useState } from 'react'
import Stepper, { type Step } from './Stepper'

export default function PageShell({
  left,
  center,
  right,
  steps,
}: {
  left?: ReactNode
  center: ReactNode
  right?: ReactNode
  steps: Step[]
}) {
  const [current, setCurrent] = useState(steps[0]?.id || 'step-1')
  const content = useMemo(() => center, [center, current])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_360px] gap-4 md:gap-6">
      <aside className="hidden lg:block">
        <div className="sticky top-4">
          <Stepper steps={steps} current={current} onChange={setCurrent} />
          {left}
        </div>
      </aside>

      <main className="min-w-0">
        {content}
      </main>

      <aside className="hidden lg:block">
        <div className="sticky top-4 space-y-4">
          {right}
        </div>
      </aside>
    </div>
  )
}
