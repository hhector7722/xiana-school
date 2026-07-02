'use client'

import type { YesNo } from '@/types'

interface YesNoToggleProps {
  value: YesNo
  onChange: (value: YesNo) => void
}

export function YesNoToggle({ value, onChange }: YesNoToggleProps) {
  return (
    <div className="flex gap-3 w-full" role="radiogroup" aria-label="Seleccionar respuesta">
      {(['no', 'yes'] as const).map((opt) => {
        const selected = value === opt
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={opt === 'yes' ? 'Sí' : 'No'}
            onClick={() => onChange(opt)}
            className={[
              'flex-1 h-10 rounded-xl border text-sm font-medium',
              'transition-all duration-150 ease-out focus:outline-none',
              selected
                ? 'bg-accent text-white border-accent scale-100'
                : 'bg-white text-gray-500 border-[#ECECEC] hover:border-gray-300 hover:text-gray-900 active:scale-[0.98]',
              'focus:ring-2 focus:ring-accent/20',
            ].join(' ')}
          >
            {opt === 'yes' ? 'Sí' : 'No'}
          </button>
        )
      })}
    </div>
  )
}
