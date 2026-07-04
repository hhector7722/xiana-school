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

const compactGaps: Record<string, string> = {
  spacious: 'gap-3',
  normal: 'gap-3',
  compact: 'gap-1.5',
}

const compactQuestionGap: Record<string, string> = {
  spacious: 'space-y-3',
  normal: 'space-y-2.5',
  compact: 'space-y-1.5',
}

const compactQuestionItemGap: Record<string, string> = {
  spacious: 'space-y-2',
  normal: 'space-y-1.5',
  compact: 'space-y-1',
}

const compactTitle: Record<string, string> = {
  spacious: 'text-xl sm:text-2xl',
  normal: 'text-xl sm:text-2xl',
  compact: 'text-lg sm:text-xl',
}

const compactSubtitle: Record<string, string> = {
  spacious: 'text-xs sm:text-sm',
  normal: 'text-xs sm:text-sm',
  compact: 'text-[11px] sm:text-xs',
}

const compactQuestionText: Record<string, string> = {
  spacious: 'text-sm sm:text-base',
  normal: 'text-sm sm:text-base',
  compact: 'text-xs sm:text-sm',
}

const compactButtonPt: Record<string, string> = {
  spacious: 'pt-3',
  normal: 'pt-1.5',
  compact: 'pt-1',
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
  const isCompact = density === 'compact'
  const isSpacious = density === 'spacious'

  const handleTranscriptChange = useCallback(
    (transcript: string) => onTranscriptChange(transcript),
    [onTranscriptChange],
  )

  const gapClass = compactGaps[density]
  const questionGapClass = compactQuestionGap[density]
  const questionItemGapClass = compactQuestionItemGap[density]
  const titleClass = compactTitle[density]
  const subtitleClass = compactSubtitle[density]
  const questionTextClass = compactQuestionText[density]
  const buttonPtClass = compactButtonPt[density]

  return (
    <div
      ref={rootRef}
      className={`flex flex-col ${gapClass} py-2 relative`}
      style={{ minHeight: isSpacious ? 'calc(100dvh - 56px)' : undefined }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h2 className={`${titleClass} font-medium tracking-tight text-gray-900 leading-tight`}>
            {block.title}
          </h2>
          {block.subtitle && (
            <p className={`${subtitleClass} text-gray-500 leading-relaxed mt-0.5`}>
              {block.subtitle}
            </p>
          )}
        </div>
        <img
          src="/logo.png"
          alt="Logo"
          className="h-8 sm:h-9 ml-3 shrink-0"
        />
      </div>

      <hr className="border-t border-gray-100" />

      <div className={`${questionGapClass} ${isSpacious ? 'flex-1 flex flex-col justify-center' : ''}`}>
        {block.questions.map((q) => (
          <div key={q.id} className={questionItemGapClass}>
            <p className={`${questionTextClass} font-semibold text-gray-900 leading-snug`}>{q.text}</p>
            <YesNoToggle
              value={answers[q.id] ?? null}
              onChange={(v) => onAnswer(q.id, v)}
            />
          </div>
        ))}
      </div>

      <AudioRecorder
        question={block.audioPrompt}
        initialTranscript={initialTranscript}
        onTranscriptChange={handleTranscriptChange}
        compact={isCompact}
      />

      <ProgressBar current={stepNumber} total={totalSteps} />

      <div className={`flex items-center justify-between ${buttonPtClass}`}>
        <Button
          variant="secondary"
          onClick={onBack}
          size={isCompact ? 'sm' : undefined}
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
            size={isCompact ? 'sm' : undefined}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
