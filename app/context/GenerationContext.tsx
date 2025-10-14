"use client"
import { createContext, useContext } from 'react'
import { useGenerationReducer } from '../hooks/useGenerationReducer'

type Ctx = ReturnType<typeof useGenerationReducer>

const GenerationContext = createContext<Ctx | null>(null)

export function GenerationProvider({ children }: { children: React.ReactNode }) {
  const value = useGenerationReducer()
  return <GenerationContext.Provider value={value}>{children}</GenerationContext.Provider>
}

export function useGeneration() {
  const ctx = useContext(GenerationContext)
  if (!ctx) throw new Error('useGeneration must be used within GenerationProvider')
  return ctx
}
