'use client'

import { useState, useLayoutEffect, RefObject } from 'react'

export type Density = 'spacious' | 'normal' | 'compact'

const VERTICAL_MARGIN = 56

export function useDensity(ref: RefObject<HTMLDivElement | null>, deps: any[]): Density {
  const [density, setDensity] = useState<Density>('normal')

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const available = window.innerHeight - VERTICAL_MARGIN
    const contentHeight = el.scrollHeight

    if (contentHeight <= available * 0.7) {
      setDensity('spacious')
    } else if (contentHeight <= available) {
      setDensity('normal')
    } else {
      setDensity('compact')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return density
}
