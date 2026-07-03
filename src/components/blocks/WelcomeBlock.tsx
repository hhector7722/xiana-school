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

      <p className="text-base sm:text-lg text-gray-500 leading-relaxed mb-3 max-w-md">
        Analicemos tus procesos actuales y identifiquemos los puntos de fricción en tu día a día.
      </p>

      <p className="text-sm text-gray-400 leading-relaxed mb-10">
        Este diagnóstico es el primer paso para diseñar una herramienta a tu medida. Tus avances se guardan automáticamente.
      </p>

      <Button onClick={onStart} className="min-w-[140px]" aria-label="Comenzar el cuestionario">
        Comenzar
      </Button>
    </div>
  )
}
