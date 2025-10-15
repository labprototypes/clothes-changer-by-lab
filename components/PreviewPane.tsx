"use client"
import ResultPreview from './ResultPreview'

export default function PreviewPane() {
  return (
    <div className="card p-4 md:p-5 lg:p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title">Предпросмотр</h2>
        <div className="flex items-center gap-2 text-xs">
          {/* future: download/open buttons live here too if needed */}
        </div>
      </div>
      <ResultPreview />
    </div>
  )
}
