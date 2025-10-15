"use client"
import UploadZone from './UploadZone'
import { useGeneration } from '@/app/context/GenerationContext'
import UploadGrid from './UploadGrid'

export default function ReferenceSection() {
  const { state, dispatch, orderingMap } = useGeneration()
  const opt = state.options || {}
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
            <UploadGrid
              items={block.items}
              ordering={orderingMap}
              onComment={(i, text) => dispatch({ type: 'setItemComment', area: 'ref', kind: key, index: i, text })}
              onRemove={(i) => dispatch({ type: 'removeRefItem', refKind: key, index: i })}
            />
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
