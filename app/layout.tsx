import './globals.css'
import { GenerationProvider } from './context/GenerationContext'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clothes Changer by LAB',
  description: 'AI-powered clothes replacement and style generation',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-dvh bg-soft text-ink">
        <GenerationProvider>
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
            <header className="mb-4 md:mb-6 lg:mb-8">
              <h1 className="text-2xl md:text-3xl font-semibold">Clothes Changer</h1>
              <p className="text-sm text-gray-500">Соберите лук, выберите режим, сгенерируйте результат</p>
            </header>
            {children}
          </div>
        </GenerationProvider>
      </body>
    </html>
  )
}
