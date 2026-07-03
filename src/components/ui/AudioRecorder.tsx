'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'

interface AudioRecorderProps {
  question: string
  initialTranscript?: string
  onTranscriptChange: (transcript: string) => void
}

const BAR_COUNT = 20

function VolumeVisualizer({ volume }: { volume: number }) {
  const barsRef = useRef<number[]>([])
  if (barsRef.current.length !== BAR_COUNT) {
    barsRef.current = Array.from({ length: BAR_COUNT }, () => Math.random())
  }

  return (
    <div className="flex items-center justify-between gap-0 h-9 w-full">
      {barsRef.current.map((seed, i) => {
        const variation = 0.2 + 0.8 * seed
        const center = (i - BAR_COUNT / 2) / (BAR_COUNT / 2)
        const envelope = 1 - Math.abs(center) * 0.5
        const raw = envelope * variation * volume
        const height = raw * 36
        return (
          <div
            key={i}
            className="w-[2px] rounded-full bg-accent"
            style={{
              height: `${Math.max(0, height)}px`,
              transition: 'height 40ms ease',
              opacity: Math.min(1, 0.15 + volume * 0.85),
            }}
          />
        )
      })}
    </div>
  )
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function AudioRecorder({ question, initialTranscript, onTranscriptChange }: AudioRecorderProps) {
  const { status, transcript, volume, startRecording, stopRecording, reset } =
    useAudioRecorder()

  const [textContent, setTextContent] = useState(initialTranscript ?? '')
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [])

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setTextContent(value)
    onTranscriptChange(value)
  }

  useEffect(() => {
    autoResize()
  }, [textContent, autoResize])

  useEffect(() => {
    if (status === 'done' && transcript) {
      setTextContent(transcript)
      onTranscriptChange(transcript)
    }
  }, [status, transcript, onTranscriptChange])

  useEffect(() => {
    if (status === 'recording') {
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed((p) => p + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [status])

  function handleStartRecording() {
    if (status === 'done') reset()
    startRecording()
  }

  const showRecordButton = status === 'idle' || status === 'done'

  return (
    <div className="flex flex-col gap-4">
      <p className="text-base font-semibold text-gray-900 leading-relaxed">{question}</p>

      <textarea
        ref={textareaRef}
        value={textContent}
        onChange={handleTextChange}
        placeholder="Escribe tu respuesta aquí..."
        rows={1}
        className="w-full rounded-xl border border-[#ECECEC] p-4 text-sm text-gray-700 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent/20"
        aria-label="Respuesta"
      />

      {showRecordButton && (
        <button
          type="button"
          onClick={handleStartRecording}
          aria-label="Empezar a grabar respuesta"
          className="inline-flex items-center justify-center rounded-xl h-10 px-5 text-sm font-medium transition-all duration-150 bg-accent text-white border border-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/30 gap-2 w-fit active:scale-[0.98]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
          Grabar respuesta
        </button>
      )}

      {status === 'recording' && (
        <div
          className="flex items-center gap-3 rounded-xl border border-[#ECECEC] px-4 py-3"
          role="status"
          aria-label="Grabación en curso"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />

          <span className="text-sm tabular-nums text-gray-500 font-medium min-w-[44px]">
            {formatTime(elapsed)}
          </span>

          <div className="flex-1 flex items-center min-w-0 overflow-hidden">
            <VolumeVisualizer volume={volume} />
          </div>

          <button
            type="button"
            onClick={stopRecording}
            aria-label="Detener grabación"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-300 active:scale-[0.92]"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        </div>
      )}

      {status === 'transcribing' && (
        <div className="flex items-center gap-3 animate-fade-in" role="status" aria-label="Analizando respuesta">
          <span className="w-4 h-4 rounded-full border-2 border-[#ECECEC] border-t-accent animate-spin" />
          <span className="text-sm text-gray-400">Analizando respuesta…</span>
        </div>
      )}
    </div>
  )
}
