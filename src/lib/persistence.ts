import type { OnboardingData } from '@/types'

const STORAGE_KEY = 'julia-onboarding'

export async function save(data: OnboardingData): Promise<void> {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export async function load(): Promise<OnboardingData | null> {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  return JSON.parse(raw)
}

export async function clear(): Promise<void> {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
