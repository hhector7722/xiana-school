'use client'

import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { WelcomeBlock } from '@/components/blocks/WelcomeBlock'
import { StepBlock } from '@/components/blocks/StepBlock'
import { FinalBlock } from '@/components/blocks/FinalBlock'

type Dir = 'forward' | 'backward'
type Phase = 'idle' | 'hero-transition' | 'sliding'

interface TranState {
  phase: Phase
  dir: Dir
  prevStep: number
  displayStep: number
}

type TranAction =
  | { type: 'INIT'; step: number }
  | { type: 'START_HERO'; step: number }
  | { type: 'START_SLIDE'; step: number; dir: Dir }
  | { type: 'END_TRANSITION' }

const initialTran: TranState = { phase: 'idle', dir: 'forward', prevStep: 0, displayStep: 0 }

function tranReducer(state: TranState, action: TranAction): TranState {
  switch (action.type) {
    case 'INIT':
      return { phase: 'idle', dir: 'forward', prevStep: action.step, displayStep: action.step }
    case 'START_HERO':
      return { phase: 'hero-transition', dir: 'forward', prevStep: state.displayStep, displayStep: action.step }
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
  const [videoState, setVideoState] = useState<'idle' | 'showing' | 'hiding'>('idle')
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
      onAdvance()
      dispatchTran({ type: 'START_HERO', step: nextStep })
      setTimeout(() => dispatchTran({ type: 'END_TRANSITION' }), 600)
    } else {
      onAdvance()
      dispatchTran({ type: 'START_SLIDE', step: nextStep, dir })
      setTimeout(() => dispatchTran({ type: 'END_TRANSITION' }), 500)
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
    if (!canProceed || saveStatus !== 'idle' || videoState !== 'idle') return
    if (isWelcome) {
      startTransition(1, 'forward', () => goNext())
      return
    }

    const isSubmitting = currentStep === totalSteps

    if (isSubmitting) {
      setVideoState('showing')
      setTimeout(() => {
        setVideoState('hiding')
        setTimeout(() => {
          setVideoState('idle')
          setSaveStatus('saved')
          setTimeout(() => {
            setSaveStatus('idle')
            startTransition(currentStep + 1, 'forward', () => goNext())
          }, 200)
        }, 500)
      }, 2500)
    } else {
      setSaveStatus('saving')
      setTimeout(() => {
        setSaveStatus('saved')
        setTimeout(() => {
          setSaveStatus('idle')
          startTransition(currentStep + 1, 'forward', () => goNext())
        }, 200)
      }, 200)
    }
  }, [canProceed, saveStatus, videoState, goNext, isWelcome, currentStep, totalSteps, startTransition])

  const handleGoBack = useCallback(() => {
    if (saveStatus !== 'idle' || videoState !== 'idle') return
    startTransition(currentStep - 1, 'backward', () => goBack())
  }, [saveStatus, videoState, goBack, currentStep, startTransition])

  const handleReset = useCallback(() => {
    startTransition(0, 'backward', () => resetOnboarding())
  }, [resetOnboarding, startTransition])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-page">
        <div className="flex items-center gap-3 text-sm text-gray-400" role="status" aria-label="Cargando">
          <span className="w-4 h-4 rounded-full border-2 border-[#ECECEC] border-t-accent animate-spin" />
          Cargando…
        </div>
      </div>
    )
  }

  const idleContent = (
    <div key={tran.displayStep} className="flex-1 flex flex-col">
      {renderBlock(tran.displayStep, currentBlock, data, totalSteps, handleGoNext, handleGoBack, handleAnswer, handleTranscript, canProceed, saveStatus, handleReset)}
    </div>
  )

  const isWelcomeView = tran.displayStep === 0 && tran.phase === 'idle';

  return (
    <div className="bg-page min-h-dvh flex flex-col">
      <main className="flex-1 flex flex-col px-4 pt-3 pb-5 md:pt-6 md:pb-8">
        <div className={`w-full mx-auto flex flex-col transition-all duration-500 ease-out ${isWelcomeView ? 'max-w-lg justify-center flex-1' : 'max-w-2xl flex-1'}`}>
          <div className={`bg-white rounded-xl border border-[#ECECEC] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col relative overflow-hidden transition-all duration-500 ease-out ${isWelcomeView ? '' : 'flex-1 p-4 md:p-6'}`}>

            {/* HERO: welcome → first question */}
            {tran.phase === 'hero-transition' && (
              <>
                <div className="absolute inset-0 animate-hero-exit flex items-center justify-center">
                  <WelcomeBlock onStart={handleGoNext} />
                </div>
                <div className="absolute inset-0 animate-hero-enter" style={{ animationDelay: '0.12s' }}>
                  <div className="h-full flex flex-col">
                    {currentBlock && renderBlock(tran.displayStep, currentBlock, data, totalSteps, handleGoNext, handleGoBack, handleAnswer, handleTranscript, canProceed, saveStatus, handleReset)}
                  </div>
                </div>
              </>
            )}

            {/* SLIDING: card → card */}
            {tran.phase === 'sliding' && (
              <>
                <div
                  className={`absolute inset-0 ${tran.dir === 'forward' ? 'animate-slide-out-left' : 'animate-slide-out-right'}`}
                >
                  <div className="h-full flex flex-col">
                    {renderBlock(tran.prevStep, currentBlock, data, totalSteps, handleGoNext, handleGoBack, handleAnswer, handleTranscript, canProceed, saveStatus, handleReset)}
                  </div>
                </div>
                <div
                  className={`absolute inset-0 ${tran.dir === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
                  style={{ animationDelay: '0.04s' }}
                >
                  <div className="h-full flex flex-col">
                    {currentBlock && renderBlock(tran.displayStep, currentBlock, data, totalSteps, handleGoNext, handleGoBack, handleAnswer, handleTranscript, canProceed, saveStatus, handleReset)}
                  </div>
                </div>
              </>
            )}

            {/* IDLE: normal display */}
            {tran.phase === 'idle' && idleContent}

          </div>
        </div>

        {/* Video Overlay */}
        {videoState !== 'idle' && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ease-in-out ${videoState === 'showing' ? 'opacity-100 bg-page/80 backdrop-blur-sm' : 'opacity-0 bg-transparent'}`}>
            <div className={`w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-2xl transition-transform duration-500 ease-out ${videoState === 'showing' ? 'scale-100' : 'scale-90'}`}>
              <video 
                src="/hernan.mp4" 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
