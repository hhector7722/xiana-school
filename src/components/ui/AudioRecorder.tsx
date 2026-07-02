'use client'

import { useEffect, useState, useRef } from 'react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'

interface AudioRecorderProps {
  question: string
  initialTranscript?: string
  onTranscriptChange: (transcript: string) => void
}

const BAR_COUNT = 32

function VolumeVisualizer({ volume }: { volume: number }) {
  return (
    <div className="flex items-center gap-[2px] h-9">
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const position = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2)
        const variation = 0.4 + 0.6 * Math.sin(i * 1.8 + 0.3)
        const raw = (1 - position * 0.5) * variation * volume
        const height = 3 + raw * 28
        return (
          <div
            key={i}
            className="w-[3px] rounded-full bg-accent"
            style={{
              height: `${Math.max(3, height)}px`,
              transition: 'height 60ms ease',
              opacity: 0.5 + volume * 0.5,
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

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setTextContent(value)
    onTranscriptChange(value)
  }

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
        value={textContent}
        onChange={handleTextChange}
        placeholder="Escribe tu respuesta aquí..."
        rows={4}
        className="w-full rounded-xl border border-[#ECECEC] p-4 text-sm text-gray-700 resize-y focus:outline-none focus:ring-2 focus:ring-accent/20"
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
        <div className="flex items-center gap-4 rounded-xl border border-[#ECECEC] px-4 py-3" role="status" aria-label="Grabación en curso">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="text-sm tabular-nums text-gray-500 font-medium min-w-[48px]">
            {formatTime(elapsed)}
          </span>
          <div className="flex-1 flex items-center">
            <VolumeVisualizer volume={volume} />
          </div>
          <button
            type="button"
            onClick={stopRecording}
            aria-label="Detener grabación"
            className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/20 rounded shrink-0"
          >
            Detener
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
