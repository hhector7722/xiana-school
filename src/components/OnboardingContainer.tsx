'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { WelcomeBlock } from '@/components/blocks/WelcomeBlock'
import { StepBlock } from '@/components/blocks/StepBlock'
import { FinalBlock } from '@/components/blocks/FinalBlock'

type Dir = 'forward' | 'backward'
type Phase = 'idle' | 'hero-exiting' | 'hero-entering' | 'sliding'

interface TranState {
  phase: Phase
  dir: Dir
  prevStep: number
  displayStep: number
}

type TranAction =
  | { type: 'INIT'; step: number }
  | { type: 'START_HERO_EXIT'; step: number }
  | { type: 'START_HERO_ENTER' }
  | { type: 'START_SLIDE'; step: number; dir: Dir }
  | { type: 'END_TRANSITION' }

const initialTran: TranState = { phase: 'idle', dir: 'forward', prevStep: 0, displayStep: 0 }

function tranReducer(state: TranState, action: TranAction): TranState {
  switch (action.type) {
    case 'INIT':
      return { phase: 'idle', dir: 'forward', prevStep: action.step, displayStep: action.step }
    case 'START_HERO_EXIT':
      return { phase: 'hero-exiting', dir: 'forward', prevStep: state.displayStep, displayStep: action.step }
    case 'START_HERO_ENTER':
      return { ...state, phase: 'hero-entering' }
    case 'START_SLIDE':
      return { phase: 'sliding', dir: action.dir, prevStep: state.displayStep, displayStep: action.step }
    case 'END_TRANSITION':
      return { phase: 'idle', dir: 'forward', prevStep: state.displayStep, displayStep: state.displayStep }
  }
}

function renderBlock(
  step: number,
  currentBlock: any,
  data: any,
  totalSteps: number,
  handleGoNext: () => void,
  handleGoBack: () => void,
  handleAnswer: any,
  handleTranscript: any,
  canProceed: boolean,
  saveStatus: 'idle' | 'saving' | 'saved',
  handleReset: () => void,
) {
  if (step === 0) {
    return <WelcomeBlock onStart={handleGoNext} />
  }

  if (step > 0 && step <= totalSteps && currentBlock) {
    return (
      <StepBlock
        block={currentBlock}
        stepNumber={step}
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
    )
  }

  if (step > totalSteps) {
    return <FinalBlock onReset={handleReset} />
  }

  return null
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

  const startTransition = useCallback((nextStep: number, dir: Dir, onAdvance: () => void) => {
    const isFirstCard = dir === 'forward' && nextStep === 1
    if (isFirstCard) {
      dispatchTran({ type: 'START_HERO_EXIT', step: nextStep })
      setTimeout(() => {
        onAdvance()
        dispatchTran({ type: 'START_HERO_ENTER' })
        setTimeout(() => dispatchTran({ type: 'END_TRANSITION' }), 450)
      }, 350)
    } else {
      onAdvance()
      dispatchTran({ type: 'START_SLIDE', step: nextStep, dir })
      setTimeout(() => dispatchTran({ type: 'END_TRANSITION' }), 350)
    }
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
      startTransition(1, 'forward', () => goNext())
      return
    }
    setSaveStatus('saving')
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => {
        setSaveStatus('idle')
        startTransition(currentStep + 1, 'forward', () => goNext())
      }, 200)
    }, 200)
  }, [canProceed, saveStatus, goNext, isWelcome, currentStep, startTransition])

  const handleGoBack = useCallback(() => {
    if (saveStatus !== 'idle') return
    startTransition(currentStep - 1, 'backward', () => goBack())
  }, [saveStatus, goBack, currentStep, startTransition])

  const handleReset = useCallback(() => {
    startTransition(0, 'backward', () => resetOnboarding())
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
      <main className="flex-1 flex flex-col px-4 py-3 md:py-6">
        <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
          <div className="bg-white rounded-xl border border-[#ECECEC] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex-1 flex flex-col p-4 md:p-6 relative overflow-hidden">

            {/* HERO: welcome exiting */}
            {tran.phase === 'hero-exiting' && (
              <div key={tran.prevStep} className="animate-hero-exit flex-1 flex flex-col">
                {renderBlock(tran.prevStep, currentBlock, data, totalSteps, handleGoNext, handleGoBack, handleAnswer, handleTranscript, canProceed, saveStatus, handleReset)}
              </div>
            )}

            {/* HERO: first question entering */}
            {tran.phase === 'hero-entering' && (
              <div key={tran.displayStep} className="animate-hero-enter flex-1 flex flex-col">
                {currentBlock && renderBlock(tran.displayStep, currentBlock, data, totalSteps, handleGoNext, handleGoBack, handleAnswer, handleTranscript, canProceed, saveStatus, handleReset)}
              </div>
            )}

            {/* SLIDING: both cards move simultaneously */}
            {tran.phase === 'sliding' && (
              <>
                <div
                  key={`exit-${tran.prevStep}`}
                  className={`absolute inset-0 ${tran.dir === 'forward' ? 'animate-slide-out-left' : 'animate-slide-out-right'}`}
                >
                  <div className="h-full flex flex-col">
                    {renderBlock(tran.prevStep, currentBlock, data, totalSteps, handleGoNext, handleGoBack, handleAnswer, handleTranscript, canProceed, saveStatus, handleReset)}
                  </div>
                </div>
                <div
                  key={`enter-${tran.displayStep}`}
                  className={`absolute inset-0 ${tran.dir === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
                >
                  <div className="h-full flex flex-col">
                    {currentBlock && renderBlock(tran.displayStep, currentBlock, data, totalSteps, handleGoNext, handleGoBack, handleAnswer, handleTranscript, canProceed, saveStatus, handleReset)}
                  </div>
                </div>
              </>
            )}

            {/* IDLE: normal display */}
            {tran.phase === 'idle' && (
              <div key={tran.displayStep} className="flex-1 flex flex-col">
                {renderBlock(tran.displayStep, currentBlock, data, totalSteps, handleGoNext, handleGoBack, handleAnswer, handleTranscript, canProceed, saveStatus, handleReset)}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
