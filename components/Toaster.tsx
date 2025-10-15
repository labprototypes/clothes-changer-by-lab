"use client"
import { useEffect, useState } from 'react'
import { useGeneration } from '@/app/context/GenerationContext'

export default function Toaster() {
  const { state } = useGeneration()
  const [messages, setMessages] = useState<Array<{ id: number; text: string; kind: 'info' | 'error' }>>([])

  useEffect(() => {
    if (state.loading) {
      const id = Date.now()
      setMessages((m) => [...m, { id, text: 'Генерация…', kind: 'info' }])
      const t = setTimeout(() => setMessages((m) => m.filter((x) => x.id !== id)), 2000)
      return () => clearTimeout(t)
    }
  }, [state.loading])

  useEffect(() => {
    if (state.error) {
      const id = Date.now()
      setMessages((m) => [...m, { id, text: state.error!, kind: 'error' }])
      const t = setTimeout(() => setMessages((m) => m.filter((x) => x.id !== id)), 4000)
      return () => clearTimeout(t)
    }
  }, [state.error])

  if (messages.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`rounded-md px-3 py-2 shadow text-sm ${m.kind === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-white border border-gray-200'}`}
        >
          {m.text}
        </div>
      ))}
    </div>
  )
}
