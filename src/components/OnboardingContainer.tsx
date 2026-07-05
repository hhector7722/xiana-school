'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(console.error)
    }
  }, [videoState])
  
  // Clean transition state
  const [displayStep, setDisplayStep] = useState(0)

  // Initialize displayStep once loading is done
  useEffect(() => {
    if (!loading && displayStep === 0 && currentStep > 0) {
      setDisplayStep(currentStep)
    }
  }, [loading, currentStep, displayStep])

  // Handle clean fade transitions
  const changeStep = useCallback((newStep: number, updater: () => void) => {
    updater()
    setDisplayStep(newStep)
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
      changeStep(currentStep + 1, goNext)
    }, 1000)
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
        <motion.div 
          layout
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full mx-auto flex flex-col ${isWelcomeView ? 'max-w-lg justify-center flex-1' : 'max-w-2xl flex-1'}`}
        >
          <motion.div 
            layout
            className={`bg-white rounded-xl border border-[#ECECEC] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden ${isWelcomeView ? '' : 'flex-1 p-4 md:p-6'}`}
          >
            
            {/* CLEAN FADE WRAPPER */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={displayStep}
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ 
                  opacity: (displayStep === totalSteps && videoState !== 'idle') ? 0 : 1, 
                  scale: 1, 
                  y: 0 
                }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex-1 flex flex-col"
              >
                {renderBlock(displayStep, currentBlock, data, totalSteps, handleGoNext, handleGoBack, handleAnswer, handleTranscript, canProceed, saveStatus, handleReset)}
              </motion.div>
            </AnimatePresence>

          </motion.div>
        </motion.div>

        {/* Video Overlay */}
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-all ${videoState === 'hiding' ? 'duration-1000' : 'duration-500'} ease-in-out ${videoState === 'showing' ? 'opacity-100 bg-black/40 backdrop-blur-sm' : 'opacity-0 bg-transparent'}`}
          style={{ visibility: videoState === 'idle' ? 'hidden' : 'visible' }}
        >
          <div className={`w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-2 border-white shadow-2xl transition-transform ${videoState === 'hiding' ? 'duration-1000' : 'duration-500'} ease-out bg-black ${videoState === 'showing' ? 'scale-100 pointer-events-auto' : 'scale-90 pointer-events-none'}`}>
            <video 
              ref={videoRef}
              src="/hernan.mp4" 
              preload="auto"
              playsInline 
              onEnded={handleVideoEnd}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </main>
    </div>
  )
}
