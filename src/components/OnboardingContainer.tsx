'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { WelcomeBlock } from '@/components/blocks/WelcomeBlock'
import { StepBlock } from '@/components/blocks/StepBlock'
import { FinalBlock } from '@/components/blocks/FinalBlock'
import { Skeleton } from '@/components/ui/Skeleton'

type Phase = 'idle' | 'skeleton' | 'entering'

interface TranState {
  phase: Phase
  displayStep: number
}

type TranAction =
  | { type: 'INIT'; step: number }
  | { type: 'START_TRANSITION'; step: number }
  | { type: 'END_SKELETON' }
  | { type: 'END_ENTER' }

const initialTran: TranState = { phase: 'idle', displayStep: 0 }

function tranReducer(state: TranState, action: TranAction): TranState {
  switch (action.type) {
    case 'INIT':
      return { phase: 'idle', displayStep: action.step }
    case 'START_TRANSITION':
      return { phase: 'skeleton', displayStep: action.step }
    case 'END_SKELETON':
      return state.phase === 'skeleton' ? { ...state, phase: 'entering' } : state
    case 'END_ENTER':
      return state.phase === 'entering' ? { ...state, phase: 'idle' } : state
  }
}

export function OnboardingContainer() {
  const {
    currentStep,
    currentBlock,
    data,
    totalSteps,
    loading,
    isWelcome,
    canProceed,
    answerQuestion,
    setTranscript,
    goNext,
    goBack,
    resetOnboarding,
  } = useOnboarding()

  const [tran, dispatchTran] = useReducer(tranReducer, initialTran)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const initialized = useRef(false)

  useEffect(() => {
    if (loading) return
    if (!initialized.current) {
      initialized.current = true
      dispatchTran({ type: 'INIT', step: currentStep })
    }
  }, [currentStep, loading])

  const startTransition = useCallback((nextStep: number) => {
    dispatchTran({ type: 'START_TRANSITION', step: nextStep })
    setTimeout(() => {
      dispatchTran({ type: 'END_SKELETON' })
      setTimeout(() => dispatchTran({ type: 'END_ENTER' }), 250)
    }, 150)
  }, [])

  const handleAnswer = useCallback(
    (questionId: string, value: 'yes' | 'no' | null) => {
      if (currentBlock) answerQuestion(currentBlock.id, questionId, value)
    },
    [currentBlock, answerQuestion],
  )

  const handleTranscript = useCallback(
    (transcript: string) => {
      if (currentBlock) setTranscript(currentBlock.id, transcript)
    },
    [currentBlock, setTranscript],
  )

  const handleGoNext = useCallback(() => {
    if (!canProceed || saveStatus !== 'idle') return
    if (isWelcome) {
      startTransition(1)
      goNext()
      return
    }
    setSaveStatus('saving')
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => {
        setSaveStatus('idle')
        startTransition(currentStep + 1)
        goNext()
      }, 200)
    }, 200)
  }, [canProceed, saveStatus, goNext, isWelcome, currentStep, startTransition])

  const handleGoBack = useCallback(() => {
    if (saveStatus !== 'idle') return
    startTransition(currentStep - 1)
    goBack()
  }, [saveStatus, goBack, currentStep, startTransition])

  const handleReset = useCallback(() => {
    startTransition(0)
    resetOnboarding()
  }, [resetOnboarding, startTransition])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-page">
        <div className="flex items-center gap-3 text-sm text-gray-400" role="status" aria-label="Cargando">
          <span className="w-4 h-4 rounded-full border-2 border-[#ECECEC] border-t-accent animate-spin" />
          Cargando…
        </div>
      </div>
    )
  }

  return (
    <div className="bg-page min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-8 md:py-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-[#ECECEC] shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 md:p-10">
            {tran.phase === 'skeleton' ? (
              <div className="animate-fade-in">
                <Skeleton />
              </div>
            ) : (
              <div
                key={tran.displayStep}
                className={tran.phase === 'entering' ? 'animate-fade-in' : ''}
              >
                {tran.displayStep === 0 && (
                  <WelcomeBlock onStart={handleGoNext} />
                )}

                {currentBlock && tran.displayStep > 0 && tran.displayStep <= totalSteps && (
                  <StepBlock
                    block={currentBlock}
                    stepNumber={tran.displayStep}
                    totalSteps={totalSteps}
                    answers={data.responses[currentBlock.id]?.answers ?? {}}
                    initialTranscript={data.responses[currentBlock.id]?.transcript ?? undefined}
                    onAnswer={handleAnswer}
                    onTranscriptChange={handleTranscript}
                    onNext={handleGoNext}
                    onBack={handleGoBack}
                    canProceed={canProceed}
                    saveStatus={saveStatus}
                  />
                )}

                {tran.displayStep > totalSteps && (
                  <FinalBlock onReset={handleReset} />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
