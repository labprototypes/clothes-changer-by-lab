"use client"
import UploadZone from './UploadZone'
import { useGeneration } from '@/app/context/GenerationContext'

export default function ClothesSection() {
  const { state, dispatch, orderingMap } = useGeneration()
  const top = state.sections.find((s) => s.kind === 'top')!

  return (
    <div className="space-y-4">
      <div>
        <div className="font-medium">Верх</div>
        <UploadZone
          label="Добавить элементы (множественная загрузка)"
          onFiles={(files) => dispatch({ type: 'addSectionFiles', kind: 'top', files })}
        />
        <ul className="mt-3 space-y-2">
          {top.items.map((it, i) => (
            <li key={it.id} className="flex items-center justify-between rounded border p-2">
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500">№{orderingMap.get(it.id)}</div>
                <div className="w-12 h-12 overflow-hidden rounded bg-gray-100">
                  {it.file && <img src={URL.createObjectURL(it.file)} alt="preview" className="w-full h-full object-cover" />}
                </div>
                <input
                  className="text-sm border rounded px-2 py-1"
                  placeholder="Комментарий к этому элементу"
                  value={it.comment || ''}
                  onChange={(e) => dispatch({ type: 'setItemComment', area: 'section', kind: 'top', index: i, text: e.target.value })}
                />
              </div>
              <button className="text-xs text-red-600" onClick={() => dispatch({ type: 'removeSectionItem', kind: 'top', index: i })}>Удалить</button>
            </li>
          ))}
        </ul>
        <div className="mt-2">
          <input
            className="w-full text-sm border rounded px-2 py-1"
            placeholder="Комментарий к секции"
            value={top.sectionComment || ''}
            onChange={(e) => dispatch({ type: 'setSectionComment', kind: 'top', text: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
