'use client'

import { Button } from '@/components/ui/Button'

interface FinalBlockProps {
  onReset: () => void
}

export function FinalBlock({ onReset }: FinalBlockProps) {
  return (
    <div className="flex-1 flex flex-col items-center text-center justify-center py-6 md:py-8">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-3">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-gray-900 leading-tight mb-3">
        Perfecto.
      </h2>

      <div className="space-y-2 max-w-sm">
        <p className="text-sm text-gray-500 leading-relaxed">
          He recibido toda la información. Ahora analizaré cuidadosamente cómo trabajas para entender si una aplicación personalizada puede ayudarte realmente.
        </p>
        <p className="text-sm text-gray-500 leading-relaxed">
          A partir de ese análisis prepararé una propuesta completamente adaptada a tu forma de trabajar.
        </p>
        <p className="text-sm text-gray-500 leading-relaxed">
          Muchas gracias por tu tiempo.
        </p>
      </div>

      <Button variant="secondary" onClick={onReset} className="mt-5" aria-label="Volver al inicio del cuestionario">
        Volver al inicio
      </Button>
    </div>
  )
}
