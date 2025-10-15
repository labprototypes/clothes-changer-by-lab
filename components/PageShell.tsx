"use client"
import { ReactNode, useMemo } from 'react'
import Toaster from './Toaster'

export default function PageShell({ center, right }: { center: ReactNode; right?: ReactNode }) {
  const content = useMemo(() => center, [center])
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-4 md:gap-6">
      <main className="min-w-0">{content}</main>
      <aside className="hidden lg:block">
        <div className="sticky top-4 space-y-4">{right}</div>
      </aside>
      <Toaster />
    </div>
  )
}
