'use client'

import { Button } from '@/components/ui/Button'

interface WelcomeBlockProps {
  onStart: () => void
}

export function WelcomeBlock({ onStart }: WelcomeBlockProps) {
  return (
    <div className="flex flex-col items-center text-center py-12 md:py-16">
      <img
        src="/logo.png"
        alt="Logo"
        className="h-20 mb-6"
      />
      <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-gray-900 leading-tight mb-4">
        Hola, Julia
      </h1>

      <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-10 max-w-md">
        Analicemos cómo trabajas actualmente, qué herramientas utilizas, cómo las utilizas e identifiquemos los principales puntos de fricción de tu día a día.
      </p>

      <Button onClick={onStart} className="min-w-[140px]" aria-label="Comenzar el cuestionario">
        Comenzar
      </Button>
    </div>
  )
}
