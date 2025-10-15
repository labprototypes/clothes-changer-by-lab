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

  const steps = [
    { id: 'user', label: 'Своё фото' },
    { id: 'clothes', label: 'Типаж и одежда' },
    { id: 'refs', label: 'Референсы' },
    { id: 'options', label: 'Параметры' },
    { id: 'preview', label: 'Предпросмотр' },
  ]

  const center = (
    <div className="space-y-4">
      <section className="card p-4 md:p-5 lg:p-6">
        <h2 className="section-title mb-3">Режим и референсы</h2>
        <div className="space-y-4">
          <ModeSelector />
          <div className="border rounded-lg p-3">
            <div className="font-medium mb-2">Текущий режим: {state.mode}</div>
            <div className="help-text">Это временный индикатор состояния useReducer.</div>
          </div>
          <ReferenceSection />
          <div className="border rounded-lg p-3">
            <div className="font-medium">Текстовый бриф</div>
            <p className="help-text mb-2">Опционально. Коротко опишите желаемый результат.</p>
            <textarea
              className="w-full rounded-md border p-2 text-sm"
              rows={4}
              placeholder="Например: минималистичный street-образ..."
              value={state.textBrief}
              onChange={(e) => dispatch({ type: 'setBrief', text: e.target.value })}
            />
          </div>
          <UserImageSection />
          <section className="card p-4 md:p-5 lg:p-6">
            <h2 className="section-title mb-3">Одежда</h2>
            <ClothesSection />
          </section>
          <section className="card p-4 md:p-5 lg:p-6">
            <h2 className="section-title mb-3">Действие</h2>
            <div className="space-y-4">
              <OptionsPanel />
              <GenerateButton />
            </div>
          </section>
        </div>
      </section>
    </div>
  )

  const right = <PreviewPane />

  return <PageShell steps={steps as any} center={center} right={right} />
}
