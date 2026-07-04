'use client'

import { Button } from '@/components/ui/Button'

interface WelcomeBlockProps {
  onStart: () => void
}

export function WelcomeBlock({ onStart }: WelcomeBlockProps) {
  return (
    <div className="flex flex-col items-center py-6 md:py-8">
      <img
        src="/logo.png"
        alt="Logo"
        className="h-14 mb-3"
      />
      <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-gray-900 leading-tight mb-3">
        Hola, Julia
      </h1>

      <div className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6 w-full text-left space-y-1">
        <p>Analicemos cómo trabajas actualmente,</p>
        <p>qué herramientas utilizas,</p>
        <p>cómo las utilizas</p>
        <p>e identifiquemos los principales puntos de fricción de tu día a día.</p>
      </div>

      <Button onClick={onStart} className="min-w-[120px]" aria-label="Comenzar el cuestionario">
        Comenzar
      </Button>
    </div>
  )
}
