"use client"
import UploadZone from './UploadZone'
import { useGeneration } from '@/app/context/GenerationContext'

export default function ReferenceSection() {
  const { state, dispatch, orderingMap } = useGeneration()
  const refKinds = [
    { key: 'light' as const, title: 'Свет' },
    { key: 'color' as const, title: 'Цвет' },
    { key: 'style' as const, title: 'Стиль' },
  ]

  return (
    <div className="space-y-6">
      {refKinds.map(({ key, title }) => {
        const block = state.refs[key] || { items: [], comment: '' }
        return (
          <div key={key}>
            <div className="font-medium">{title}</div>
            <UploadZone label={`Загрузить референсы: ${title}`} onFiles={(files) => dispatch({ type: 'addRefFiles', refKind: key, files })} />
            <ul className="mt-3 space-y-2">
              {block.items.map((it, i) => (
                <li key={it.id} className="flex items-center justify-between rounded border p-2">
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-500">№{orderingMap.get(it.id)}</div>
                    <div className="w-12 h-12 overflow-hidden rounded bg-gray-100">
                      {it.file && <img src={URL.createObjectURL(it.file)} alt="ref" className="w-full h-full object-cover" />}
                    </div>
                    <input
                      className="text-sm border rounded px-2 py-1"
                      placeholder="Комментарий к этому референсу"
                      value={it.comment || ''}
                      onChange={(e) => dispatch({ type: 'setItemComment', area: 'ref', kind: key, index: i, text: e.target.value })}
                    />
                  </div>
                  <button className="text-xs text-red-600" onClick={() => dispatch({ type: 'removeRefItem', refKind: key, index: i })}>Удалить</button>
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <input
                className="w-full text-sm border rounded px-2 py-1"
                placeholder={`Комментарий к блоку «${title}»`}
                value={block.comment || ''}
                onChange={(e) => dispatch({ type: 'setRefComment', refKind: key, text: e.target.value })}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
