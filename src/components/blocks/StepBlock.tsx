'use client'

import { useCallback, useRef } from 'react'
import type { BlockDef, YesNo } from '@/types'
import { Button } from '@/components/ui/Button'
import { YesNoToggle } from '@/components/ui/YesNoToggle'
import { AudioRecorder } from '@/components/ui/AudioRecorder'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useDensity } from '@/hooks/useDensity'
import type { Density } from '@/hooks/useDensity'

interface StepBlockProps {
  block: BlockDef
  stepNumber: number
  totalSteps: number
  answers: Record<string, YesNo>
  onAnswer: (questionId: string, value: YesNo) => void
  onTranscriptChange: (transcript: string) => void
  initialTranscript?: string
  onNext: () => void
  onBack: () => void
  canProceed: boolean
  saveStatus?: 'idle' | 'saving' | 'saved'
}

const config: Record<Density, {
  gap: string
  questionItemGap: string
  title: string
  subtitle: string
  questionText: string
  logo: string
  buttonPt: string
  buttonSize: 'sm' | 'md'
  recorderCompact: boolean
}> = {
  spacious: {
    gap: 'gap-5',
    questionItemGap: 'space-y-2',
    title: 'text-xl sm:text-2xl',
    subtitle: 'text-xs sm:text-sm',
    questionText: 'text-sm sm:text-base',
    logo: 'h-8 sm:h-9',
    buttonPt: 'pt-1',
    buttonSize: 'md',
    recorderCompact: false,
  },
  normal: {
    gap: 'gap-3',
    questionItemGap: 'space-y-1.5',
    title: 'text-xl sm:text-2xl',
    subtitle: 'text-xs sm:text-sm',
    questionText: 'text-sm sm:text-base',
    logo: 'h-8 sm:h-9',
    buttonPt: 'pt-0.5',
    buttonSize: 'md',
    recorderCompact: false,
  },
  compact: {
    gap: 'gap-1.5',
    questionItemGap: 'space-y-1',
    title: 'text-lg sm:text-xl',
    subtitle: 'text-[11px] sm:text-xs',
    questionText: 'text-xs sm:text-sm',
    logo: 'h-7 sm:h-8',
    buttonPt: 'pt-0',
    buttonSize: 'sm',
    recorderCompact: true,
  },
}

export function StepBlock({
  block,
  stepNumber,
  totalSteps,
  answers,
  onAnswer,
  onTranscriptChange,
  initialTranscript,
  onNext,
  onBack,
  canProceed,
  saveStatus = 'idle',
}: StepBlockProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const density: Density = useDensity(rootRef, [block.id, answers, initialTranscript])
  const c = config[density]

  const handleTranscriptChange = useCallback(
    (transcript: string) => onTranscriptChange(transcript),
    [onTranscriptChange],
  )

  return (
    <div
      ref={rootRef}
      className={`flex-1 flex flex-col justify-between ${c.gap} relative`}
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className={`${c.title} font-medium tracking-tight text-gray-900 leading-tight`}>
              {block.title}
            </h2>
            {block.subtitle && (
              <p className={`${c.subtitle} text-gray-500 leading-relaxed mt-0.5`}>
                {block.subtitle}
              </p>
            )}
          </div>
          <img
            src="/logo.png"
            alt="Logo"
            className={`${c.logo} ml-3 shrink-0`}
          />
        </div>

        <hr className="border-t border-gray-100 mt-0.5" />
      </div>

      {block.questions.map((q) => (
        <div key={q.id} className={c.questionItemGap}>
          <p className={`${c.questionText} font-semibold text-gray-900 leading-snug`}>{q.text}</p>
          <YesNoToggle
            value={answers[q.id] ?? null}
            onChange={(v) => onAnswer(q.id, v)}
          />
        </div>
      ))}

      <AudioRecorder
        question={block.audioPrompt}
        initialTranscript={initialTranscript}
        onTranscriptChange={handleTranscriptChange}
        compact={c.recorderCompact}
      />

      <ProgressBar current={stepNumber} total={totalSteps} />

      <div className={`flex items-center justify-between ${c.buttonPt}`}>
        <Button
          variant="secondary"
          onClick={onBack}
          size={c.buttonSize}
        >
          Atrás
        </Button>
        <div className="flex items-center gap-3">
          {saveStatus === 'saving' && (
            <span className="text-xs text-gray-400 animate-fade-in" role="status" aria-label="Guardando">
              <span className="w-3 h-3 rounded-full border border-[#ECECEC] border-t-accent animate-spin inline-block align-middle mr-1.5" />
              Guardando…
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-xs text-accent animate-fade-in" role="status" aria-label="Guardado">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline-block align-middle mr-1"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Guardado
            </span>
          )}
          <Button
            onClick={onNext}
            disabled={!canProceed || saveStatus !== 'idle'}
            aria-label="Continuar al siguiente paso"
            size={c.buttonSize}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
