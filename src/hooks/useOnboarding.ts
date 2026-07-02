'use client'

import { useState, useCallback, useEffect } from 'react'
import type { YesNo, OnboardingData } from '@/types'
import { blocks } from '@/lib/onboarding/questions'
import { save, load } from '@/lib/persistence'

function emptyData(): OnboardingData {
  return { responses: {}, completed: false, finishedAt: null }
}

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(emptyData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load().then((saved) => {
      if (saved) {
        setData(saved)
        if (!saved.completed) {
          const lastIncomplete = blocks.findIndex(
            (b) => !saved.responses[b.id]?.answers,
          )
          if (lastIncomplete > 0) setCurrentStep(lastIncomplete)
        }
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (loading) return
    save(data)
  }, [data, loading])

  const totalSteps = blocks.length
  const isWelcome = currentStep === 0
  const isFinal = currentStep === totalSteps + 1
  const currentBlockIndex = currentStep - 1
  const currentBlock =
    currentBlockIndex >= 0 && currentBlockIndex < totalSteps
      ? blocks[currentBlockIndex]
      : null

  const progressValue =
    currentStep === 0
      ? 0
      : currentStep > totalSteps
        ? totalSteps
        : currentStep

  function isBlockComplete(blockId: string) {
    const block = blocks.find((b) => b.id === blockId)
    if (!block) return false
    const response = data.responses[blockId]
    if (!response) return false
    return block.questions.every((q) => response.answers[q.id] != null)
  }

  const canProceed =
    isWelcome ||
    isFinal ||
    (currentBlock !== null && isBlockComplete(currentBlock.id))

  const answerQuestion = useCallback(
    (blockId: string, questionId: string, value: YesNo) => {
      setData((prev) => ({
        ...prev,
        responses: {
          ...prev.responses,
          [blockId]: {
            answers: {
              ...(prev.responses[blockId]?.answers ?? {}),
              [questionId]: value,
            },
            transcript: prev.responses[blockId]?.transcript ?? null,
          },
        },
      }))
    },
    [],
  )

  const setTranscript = useCallback(
    (blockId: string, transcript: string) => {
      setData((prev) => ({
        ...prev,
        responses: {
          ...prev.responses,
          [blockId]: {
            answers: prev.responses[blockId]?.answers ?? {},
            transcript,
          },
        },
      }))
    },
    [],
  )

  const goNext = useCallback(() => {
    if (isWelcome) {
      setCurrentStep(1)
    } else if (currentStep < totalSteps) {
      setCurrentStep((p) => p + 1)
    } else if (currentStep === totalSteps) {
      setData((prev) => ({ ...prev, completed: true, finishedAt: new Date().toISOString() }))
      setCurrentStep(totalSteps + 1)
    }
  }, [isWelcome, currentStep, totalSteps])

  const goBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep((p) => p - 1)
  }, [currentStep])

  const resetOnboarding = useCallback(() => {
    setCurrentStep(0)
    setData(emptyData())
  }, [])

  return {
    currentStep,
    currentBlock,
    data,
    totalSteps,
    loading,
    isWelcome,
    isFinal,
    progressValue,
    canProceed,
    answerQuestion,
    setTranscript,
    goNext,
    goBack,
    resetOnboarding,
  }
}
