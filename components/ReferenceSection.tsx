"use client"
import UploadZone from './UploadZone'
import { useGeneration } from '@/app/context/GenerationContext'

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
      <div className="rounded border p-3 space-y-3">
        <div className="font-medium">Формат / Размер</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Размер (size)</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={opt.size || '2K'}
              onChange={(e) => { dispatch({ type: 'setOption', key: 'size', value: e.target.value as any }); dispatch({ type: 'setOption', key: 'autoSized', value: false }) }}
            >
              <option value="1K">1K</option>
              <option value="2K">2K</option>
              <option value="4K">4K</option>
            </select>
            {opt.autoSized && <div className="mt-1 text-[10px] text-green-600">Автовыбор по фото пользователя</div>}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Соотношение сторон</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={opt.aspectRatio || 'match_input_image'}
              onChange={(e) => dispatch({ type: 'setOption', key: 'aspectRatio', value: e.target.value })}
            >
              <option value="match_input_image">Авто (по входу)</option>
              <option value="1:1">1:1</option>
              <option value="4:3">4:3</option>
              <option value="16:9">16:9</option>
            </select>
          </div>
          <div className="text-xs text-gray-500 flex items-end">Если есть фото пользователя — формат «match_input_image» для согласования.</div>
        </div>
      </div>
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
