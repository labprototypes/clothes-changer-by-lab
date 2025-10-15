"use client"
import ResultPreview from './ResultPreview'
import { useGeneration } from '@/app/context/GenerationContext'

export default function PreviewPane() {
  const { state, dispatch } = useGeneration()
  return (
    <div className="card p-4 md:p-5 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Предпросмотр</h2>
      </div>
      <ResultPreview />
      {state.history.length > 0 && (
        <div>
          <div className="text-sm font-medium mb-2">История</div>
          <div className="grid grid-cols-3 gap-2">
            {state.history.map((h) => (
              <button
                key={h.id}
                type="button"
                className="group relative rounded overflow-hidden border hover:shadow"
                onClick={() => dispatch({ type: 'setResult', base64: h.base64 })}
                title={`size: ${h.size || '-'} | ar: ${h.aspectRatio || '-'} | seed: ${h.seed ?? 'rnd'}`}
              >
                <img src={`data:image/png;base64,${h.base64}`} alt="result" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
