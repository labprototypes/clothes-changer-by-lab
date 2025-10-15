"use client"
import ClothesSection from '@/components/ClothesSection'
import ReferenceSection from '@/components/ReferenceSection'
import UserImageSection from '@/components/UserImageSection'
import ModeSelector from '@/components/ModeSelector'
import OptionsPanel from '@/components/OptionsPanel'
import GenerateButton from '@/components/GenerateButton'
import { useGenerationReducer } from './hooks/useGenerationReducer'
import PageShell from '@/components/PageShell'
import PreviewPane from '@/components/PreviewPane'

export default function Page() {
  const { state, dispatch } = useGenerationReducer()

  const center = (
    <div className="space-y-4">
      <section id="section-user" className="card p-4 md:p-5 lg:p-6">
        <h2 className="section-title mb-3">Своё изображение</h2>
        <UserImageSection />
      </section>

      <section id="section-brief" className="card p-4 md:p-5 lg:p-6">
        <h2 className="section-title mb-3">Текстовый бриф</h2>
        <div className="space-y-2">
          <p className="help-text">Опционально. Коротко опишите желаемый результат.</p>
          <textarea
            className="w-full rounded-md border p-2 text-sm"
            rows={4}
            placeholder="Например: минималистичный street-образ..."
            value={state.textBrief}
            onChange={(e) => dispatch({ type: 'setBrief', text: e.target.value })}
          />
        </div>
      </section>

      <section id="section-refs" className="card p-4 md:p-5 lg:p-6">
        <h2 className="section-title mb-3">Референсы</h2>
        <ReferenceSection />
      </section>

      <section id="section-clothes" className="card p-4 md:p-5 lg:p-6">
        <h2 className="section-title mb-3">Типаж и одежда</h2>
        <ClothesSection />
      </section>

      <section id="section-options" className="card p-4 md:p-5 lg:p-6">
        <h2 className="section-title mb-3">Параметры</h2>
        <div className="space-y-4">
          <ModeSelector />
          <OptionsPanel />
          <GenerateButton />
        </div>
      </section>
    </div>
  )

  const right = <PreviewPane />

  return <PageShell center={center} right={right} />
}
