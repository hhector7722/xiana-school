'use client'

import { useCallback } from 'react'
import type { BlockDef, YesNo } from '@/types'
import { Button } from '@/components/ui/Button'
import { YesNoToggle } from '@/components/ui/YesNoToggle'
import { AudioRecorder } from '@/components/ui/AudioRecorder'
import { ProgressBar } from '@/components/ui/ProgressBar'

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
  const handleTranscriptChange = useCallback(
    (transcript: string) => onTranscriptChange(transcript),
    [onTranscriptChange],
  )

  return (
    <div className="flex flex-col gap-3 py-2 relative">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-gray-900 leading-tight">
            {block.title}
          </h2>
          {block.subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mt-0.5">
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

      <div className="space-y-2.5">
        {block.questions.map((q) => (
          <div key={q.id} className="space-y-1.5">
            <p className="text-sm sm:text-base font-semibold text-gray-900 leading-snug">{q.text}</p>
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
      />

      <ProgressBar current={stepNumber} total={totalSteps} />

      <div className="flex items-center justify-between pt-1.5">
        <Button variant="secondary" onClick={onBack}>
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
          <Button onClick={onNext} disabled={!canProceed || saveStatus !== 'idle'} aria-label="Continuar al siguiente paso">
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
