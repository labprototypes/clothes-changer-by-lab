export default function GenerateButton() {
  return (
    <div>
      <button className="px-3 py-2 rounded-md bg-primary text-ink font-medium">Сгенерировать</button>
      <p className="help-text mt-2">Отправляет данные на /api/generate и показывает прогресс.</p>
    </div>
  )
}
