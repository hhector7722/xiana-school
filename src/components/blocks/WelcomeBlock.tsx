'use client'

import { Button } from '@/components/ui/Button'

interface WelcomeBlockProps {
  onStart: () => void
}

export function WelcomeBlock({ onStart }: WelcomeBlockProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 md:py-8">
      <img
        src="/logo.png"
        alt="Logo"
        className="h-14 mb-3"
      />
      <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-gray-900 leading-tight mb-3">
        Hola, Julia
      </h1>

      <div className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6 w-full text-left pl-5 space-y-2.5 max-w-md">
        <p>Me gustaría conocerte un poco mejor para entender qué necesitas realmente.</p>
        <p>Solo así podré valorar si puedo ayudarte y de qué manera.</p>
        <p>No hay respuestas correctas o incorrectas. Simplemente responde con naturalidad.</p>
        <p>Será rápido.</p>
      </div>

      <Button onClick={onStart} className="min-w-[120px]" aria-label="Comenzar el cuestionario">
        Comenzar
      </Button>
    </div>
  )
}
