export default function Page() {
  return (
    <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Левая колонка — Одежда */}
      <section className="card p-4 md:p-5 lg:p-6">
        <h2 className="section-title mb-3">Одежда</h2>
        <div className="space-y-4">
          <div className="border rounded-lg p-3">
            <div className="font-medium">Верх</div>
            <p className="help-text">Загрузите несколько изображений. Комментарии необязательны.</p>
          </div>
          <div className="border rounded-lg p-3">
            <div className="font-medium">Низ</div>
            <p className="help-text">Загрузите несколько изображений. Комментарии необязательны.</p>
          </div>
          <div className="border rounded-lg p-3">
            <div className="font-medium">Обувь</div>
            <p className="help-text">Загрузите несколько изображений. Комментарии необязательны.</p>
          </div>
          <div className="border rounded-lg p-3">
            <div className="font-medium">Аксессуары</div>
            <p className="help-text">Загрузите несколько изображений. Комментарии необязательны.</p>
          </div>
        </div>
      </section>

      {/* Средняя колонка — Режим и референсы */}
      <section className="card p-4 md:p-5 lg:p-6">
        <h2 className="section-title mb-3">Режим и референсы</h2>
        <div className="space-y-4">
          <div className="border rounded-lg p-3">
            <div className="font-medium mb-2">Режим работы</div>
            <p className="help-text">Выберите: по тексту, по референсам или замена одежды на своём фото.</p>
          </div>
          <div className="border rounded-lg p-3">
            <div className="font-medium">Референсы</div>
            <p className="help-text">Свет, Цвет, Стиль — загрузите изображения-референсы.</p>
          </div>
          <div className="border rounded-lg p-3">
            <div className="font-medium">Текстовый бриф</div>
            <p className="help-text">Опционально. Коротко опишите желаемый результат.</p>
          </div>
          <div className="border rounded-lg p-3">
            <div className="font-medium">Своё изображение</div>
            <p className="help-text">1–3 фото пользователя. Обязательно для режима замены.</p>
          </div>
        </div>
      </section>

      {/* Правая колонка — Действие */}
      <aside className="card p-4 md:p-5 lg:p-6">
        <h2 className="section-title mb-3">Действие</h2>
        <div className="space-y-4">
          <div className="border rounded-lg p-3">
            <div className="font-medium">Стиль (пресет)</div>
            <p className="help-text">street, classic, minimal, sport</p>
          </div>
          <div className="border rounded-lg p-3">
            <div className="font-medium">Опции</div>
            <p className="help-text">фон, детальность, seed и др.</p>
          </div>
          <div className="border rounded-lg p-3">
            <div className="font-medium">Сгенерировать</div>
            <p className="help-text">Кнопка запуска и прогресс выполнения.</p>
          </div>
          <div className="border rounded-lg p-3">
            <div className="font-medium">Результат</div>
            <p className="help-text">Превью и кнопка «Скачать».</p>
          </div>
        </div>
      </aside>
    </main>
  )
}
