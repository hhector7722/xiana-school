'use client'

import type { YesNo } from '@/types'

interface YesNoToggleProps {
  value: YesNo
  onChange: (value: YesNo) => void
}

export function YesNoToggle({ value, onChange }: YesNoToggleProps) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Seleccionar respuesta">
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
              'px-4 h-7 rounded-full text-xs font-semibold',
              'transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-accent/20',
              selected
                ? 'bg-accent/10 text-accent border border-accent/25'
                : 'bg-white text-gray-400 border border-[#E8E8E8] hover:border-gray-300 hover:text-gray-600',
            ].join(' ')}
          >
            {opt === 'yes' ? 'Sí' : 'No'}
          </button>
        )
      })}
    </div>
  )
}
