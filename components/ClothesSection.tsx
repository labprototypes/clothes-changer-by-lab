"use client"
import UploadZone from './UploadZone'
import UploadGrid from './UploadGrid'
import { useGeneration } from '@/app/context/GenerationContext'

export default function ClothesSection() {
  const { state, dispatch, orderingMap } = useGeneration()

  const renderBlock = (kind: 'face' | 'top' | 'bottom' | 'shoes' | 'accessories', title: string) => {
    const section = state.sections.find((s) => s.kind === kind)!
    return (
      <div>
        <div className="font-medium">{title}</div>
        <UploadZone
          label="Добавить элементы (множественная загрузка)"
          onFiles={(files) => dispatch({ type: 'addSectionFiles', kind, files })}
        />
        <UploadGrid
          items={section.items}
          ordering={orderingMap}
          onComment={(i, text) => dispatch({ type: 'setItemComment', area: 'section', kind: kind as any, index: i, text })}
          onRemove={(i) => dispatch({ type: 'removeSectionItem', kind, index: i })}
        />
        <div className="mt-2">
          <input
            className="w-full text-sm border rounded px-2 py-1"
            placeholder="Комментарий к секции"
            value={section.sectionComment || ''}
            onChange={(e) => dispatch({ type: 'setSectionComment', kind, text: e.target.value })}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {renderBlock('face', 'Лицо / типаж модели')}
      {renderBlock('top', 'Верх')}
      {renderBlock('bottom', 'Низ')}
      {renderBlock('shoes', 'Обувь')}
      {renderBlock('accessories', 'Аксессуары')}
    </div>
  )
}
