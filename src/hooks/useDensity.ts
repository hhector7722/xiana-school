'use client'

import { useState, useLayoutEffect, RefObject } from 'react'

export type Density = 'spacious' | 'normal' | 'compact'

export function useDensity(ref: RefObject<HTMLDivElement | null>, deps: any[]): Density {
  const [density, setDensity] = useState<Density>('spacious')

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const avail = el.clientHeight

    if (avail <= 0) return

    const overflow = el.scrollHeight - avail

    if (overflow <= 0) {
      setDensity('spacious')
    } else if (overflow <= 48) {
      setDensity('normal')
    } else {
      setDensity('compact')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return density
}
