'use client'

import { Button } from '@/components/ui/Button'
import { useEffect, useRef } from 'react'

interface FinalBlockProps {
  onReset: () => void
}

export function FinalBlock({ onReset }: FinalBlockProps) {
  const hasSent = useRef(false)

  useEffect(() => {
    if (hasSent.current) return
    hasSent.current = true

    const rawData = localStorage.getItem('julia-onboarding')
    if (!rawData) return

    fetch("https://formsubmit.co/ajax/hhector7722@gmail.com", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: "Nuevas respuestas del cuestionario Julia",
        Respuestas: rawData
      })
    }).catch(err => console.error("Error al enviar respuestas:", err))
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 md:py-8">
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

      <div className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6 w-full text-left pl-5 space-y-2 max-w-md">
        <p>Muchas gracias por tu tiempo.</p>
        <p>En unos días contactaré contigo.</p>
      </div>

      <Button variant="secondary" onClick={onReset} className="mt-5" aria-label="Volver al inicio del cuestionario">
        Volver al inicio
      </Button>
    </div>
  )
}
