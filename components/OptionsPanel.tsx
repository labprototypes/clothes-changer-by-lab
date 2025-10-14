"use client"
import { useGeneration } from '@/app/context/GenerationContext'

export default function OptionsPanel() {
  const { state, dispatch } = useGeneration()
  const opt = state.options || {}
  return (
    <div>
      <div className="font-medium">Опции</div>
      <div className="mt-2 space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!opt.keepBackground} onChange={(e) => dispatch({ type: 'setOption', key: 'keepBackground', value: e.target.checked })} />
          Сохранить фон фото
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!opt.redrawBackground} onChange={(e) => dispatch({ type: 'setOption', key: 'redrawBackground', value: e.target.checked })} />
          Перерисовать фон
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!opt.highDetail} onChange={(e) => dispatch({ type: 'setOption', key: 'highDetail', value: e.target.checked })} />
          Высокая детальность
        </label>
        <div className="flex items-center gap-2 text-sm">
          <span>Seed:</span>
          <input
            className="w-28 border rounded px-2 py-1"
            type="number"
            placeholder="случайный"
            value={opt.seed ?? ''}
            onChange={(e) => dispatch({ type: 'setOption', key: 'seed', value: e.target.value === '' ? null : Number(e.target.value) })}
          />
          <button type="button" className="text-xs underline" onClick={() => dispatch({ type: 'setOption', key: 'seed', value: null })}>Случайный</button>
        </div>
      </div>
    </div>
  )
}
