'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { WelcomeBlock } from '@/components/blocks/WelcomeBlock'
import { StepBlock } from '@/components/blocks/StepBlock'
import { FinalBlock } from '@/components/blocks/FinalBlock'

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
    canProceed,
    answerQuestion,
    setTranscript,
    goNext,
    goBack,
    resetOnboarding,
  } = useOnboarding()

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [videoState, setVideoState] = useState<'idle' | 'showing' | 'hiding'>('idle')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoState === 'showing' && videoRef.current) {
      videoRef.current.play().catch(console.error)
    }
  }, [videoState])
  
  // Clean transition state
  const [displayStep, setDisplayStep] = useState(0)
  const [isFading, setIsFading] = useState(false)

  // Initialize displayStep once loading is done
  useEffect(() => {
    if (!loading && displayStep === 0 && currentStep > 0) {
      setDisplayStep(currentStep)
    }
  }, [loading, currentStep, displayStep])

  // Handle clean fade transitions
  const changeStep = useCallback((newStep: number, updater: () => void) => {
    setIsFading(true)
    setTimeout(() => {
      updater()
      setDisplayStep(newStep)
      setIsFading(false)
    }, 200) // 200ms fade out
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

  const handleVideoEnd = useCallback(() => {
    setVideoState('hiding')
    setTimeout(() => {
      setVideoState('idle')
      setSaveStatus('saved')
      setTimeout(() => {
        setSaveStatus('idle')
        changeStep(currentStep + 1, goNext)
      }, 200)
    }, 500)
  }, [changeStep, currentStep, goNext])

  const handleGoNext = useCallback(() => {
    if (!canProceed || saveStatus !== 'idle' || videoState !== 'idle') return

    const isSubmitting = currentStep === totalSteps
    const isWelcome = currentStep === 0

    if (isSubmitting) {
      setVideoState('showing')
    } else if (isWelcome) {
      changeStep(1, goNext)
    } else {
      setSaveStatus('saving')
      setTimeout(() => {
        setSaveStatus('saved')
        setTimeout(() => {
          setSaveStatus('idle')
          changeStep(currentStep + 1, goNext)
        }, 200)
      }, 200)
    }
  }, [canProceed, saveStatus, videoState, goNext, currentStep, totalSteps, changeStep])

  const handleGoBack = useCallback(() => {
    if (saveStatus !== 'idle' || videoState !== 'idle') return
    changeStep(currentStep - 1, goBack)
  }, [saveStatus, videoState, goBack, currentStep, changeStep])

  const handleReset = useCallback(() => {
    changeStep(0, resetOnboarding)
  }, [resetOnboarding, changeStep])

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

  const isWelcomeView = displayStep === 0

  return (
    <div className="bg-page min-h-dvh flex flex-col">
      <main className="flex-1 flex flex-col px-4 pt-3 pb-5 md:pt-6 md:pb-8">
        <div className={`w-full mx-auto flex flex-col transition-all duration-500 ease-out ${isWelcomeView ? 'max-w-lg justify-center flex-1' : 'max-w-2xl flex-1'}`}>
          <div className={`bg-white rounded-xl border border-[#ECECEC] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col transition-all duration-500 ease-out ${isWelcomeView ? '' : 'flex-1 p-4 md:p-6'}`}>
            
            {/* CLEAN FADE WRAPPER */}
            <div 
              className={`flex-1 flex flex-col transition-all duration-200 ease-in-out ${isFading ? 'opacity-0 scale-[0.98] translate-y-1' : 'opacity-100 scale-100 translate-y-0'}`}
            >
              {renderBlock(displayStep, currentBlock, data, totalSteps, handleGoNext, handleGoBack, handleAnswer, handleTranscript, canProceed, saveStatus, handleReset)}
            </div>

          </div>
        </div>

        {/* Video Overlay */}
        {videoState !== 'idle' && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-500 ease-in-out bg-black/40 backdrop-blur-sm ${videoState === 'showing' ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`w-[90vw] max-w-sm md:max-w-md rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 ease-out pointer-events-auto bg-black flex items-center justify-center ${videoState === 'showing' ? 'scale-100' : 'scale-90'}`}>
              <video 
                ref={videoRef}
                src="/hernan.mp4" 
                autoPlay 
                playsInline 
                onEnded={handleVideoEnd}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
