"use client"
import UploadZone from './UploadZone'
import { useGeneration } from '@/app/context/GenerationContext'

export default function UserImageSection() {
  const { state, dispatch, orderingMap } = useGeneration()
  const items = state.userImages.items
  return (
    <div>
      <div className="font-medium">Своё изображение</div>
      <UploadZone label="Загрузить 1–3 фото" onFiles={(files) => dispatch({ type: 'addUserFiles', files })} />
      <ul className="mt-3 space-y-2">
        {items.map((it, i) => (
          <li key={it.id} className="flex items-center justify-between rounded border p-2">
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500">№{orderingMap.get(it.id)}</div>
              <div className="w-12 h-12 overflow-hidden rounded bg-gray-100">
                {it.file && <img src={URL.createObjectURL(it.file)} alt="user" className="w-full h-full object-cover" />}
              </div>
              <input
                className="text-sm border rounded px-2 py-1"
                placeholder="Комментарий к фото"
                value={it.comment || ''}
                onChange={(e) => dispatch({ type: 'setItemComment', area: 'user', index: i, text: e.target.value })}
              />
            </div>
            <button className="text-xs text-red-600" onClick={() => dispatch({ type: 'removeUserItem', index: i })}>Удалить</button>
          </li>
        ))}
      </ul>
      <div className="mt-2">
        <input
          className="w-full text-sm border rounded px-2 py-1"
          placeholder="Комментарий к блоку"
          value={state.userImages.comment || ''}
          onChange={(e) => dispatch({ type: 'setUserComment', text: e.target.value })}
        />
      </div>
      {state.mode === 'replace-on-user' && items.length === 0 && (
        <div className="mt-2 text-xs text-red-600">Для режима замены обязательно загрузить фото пользователя.</div>
      )}
    </div>
  )
}
