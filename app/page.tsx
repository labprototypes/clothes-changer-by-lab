import ClothesSection from '@/components/ClothesSection'
import ReferenceSection from '@/components/ReferenceSection'
import UserImageSection from '@/components/UserImageSection'
import ModeSelector from '@/components/ModeSelector'
import PresetStyleSelect from '@/components/PresetStyleSelect'
import OptionsPanel from '@/components/OptionsPanel'
import GenerateButton from '@/components/GenerateButton'
import ResultPreview from '@/components/ResultPreview'

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
          <ModeSelector />
          <ReferenceSection />
          <div className="border rounded-lg p-3">
            <div className="font-medium">Текстовый бриф</div>
            <p className="help-text">Опционально. Коротко опишите желаемый результат.</p>
          </div>
          <UserImageSection />
        </div>
      </section>

      {/* Правая колонка — Действие */}
      <aside className="card p-4 md:p-5 lg:p-6">
        <h2 className="section-title mb-3">Действие</h2>
        <div className="space-y-4">
          <PresetStyleSelect />
          <OptionsPanel />
          <GenerateButton />
          <ResultPreview />
        </div>
      </aside>
    </main>
  )
}
