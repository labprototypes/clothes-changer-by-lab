"use client"
import { useGeneration } from '@/app/context/GenerationContext'

const modes: { key: 'text' | 'refs+text' | 'replace-on-user'; label: string; desc: string }[] = [
  { key: 'text', label: 'По тексту', desc: 'Сгенерировать по текстовому брифу' },
  { key: 'refs+text', label: 'Референсы + бриф', desc: 'Учитывать свет/цвет/стиль и текст' },
  { key: 'replace-on-user', label: 'Замена на фото', desc: 'Заменить одежду на своём изображении' },
]

export default function ModeSelector() {
  const { state, dispatch } = useGeneration()
  return (
    <div>
      <div className="font-medium mb-2">Режим работы</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {modes.map((m) => {
          const active = state.mode === m.key
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => dispatch({ type: 'setMode', mode: m.key })}
              className={`text-left rounded-md border p-3 ${active ? 'border-ink bg-white' : 'border-gray-200 bg-gray-50'}`}
            >
              <div className="font-medium text-sm">{m.label}</div>
              <div className="help-text">{m.desc}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
