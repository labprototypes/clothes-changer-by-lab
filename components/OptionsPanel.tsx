"use client"
import { useGeneration } from '@/app/context/GenerationContext'
import SegmentedControl from './SegmentedControl'

export default function OptionsPanel() {
  const { state, dispatch } = useGeneration()
  const opt = state.options || {}
  return (
    <div className="space-y-4">
      <div>
        <div className="font-medium mb-2">Формат</div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Размер</div>
            <SegmentedControl
              options={[{ label: '1K', value: '1K' }, { label: '2K', value: '2K' }, { label: '4K', value: '4K' }]}
              value={(opt.size as any) || '2K'}
              onChange={(v) => dispatch({ type: 'setOption', key: 'size', value: v })}
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Соотношение сторон</div>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={opt.aspectRatio || 'match_input_image'}
              onChange={(e) => dispatch({ type: 'setOption', key: 'aspectRatio', value: e.target.value })}
            >
              <option value="match_input_image">match_input_image</option>
              <option value="1:1">1:1</option>
              <option value="4:3">4:3</option>
              <option value="3:4">3:4</option>
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
              <option value="3:2">3:2</option>
              <option value="2:3">2:3</option>
              <option value="21:9">21:9</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="font-medium mb-2">Качество и фон</div>
        <div className="space-y-2">
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
        </div>
      </div>

      <div>
        <div className="font-medium mb-2">Сид</div>
        <div className="flex items-center gap-2 text-sm">
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
