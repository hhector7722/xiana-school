'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'

interface AudioRecorderProps {
  question: string
  initialTranscript?: string
  onTranscriptChange: (transcript: string) => void
  compact?: boolean
}

const COLS = 100

function VolumeVisualizer({ volume }: { volume: number }) {
  const volumeRef = useRef(volume)
  volumeRef.current = volume

  const historyRef = useRef<number[]>([])
  const colHeightsRef = useRef<number[]>([])
  const rafRef = useRef<number>(0)
  const frameCountRef = useRef(0)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let running = true
    function frame() {
      if (!running) return
      const h = historyRef.current
      const currentVolume = volumeRef.current
      const raw = currentVolume * (0.5 + 0.5 * Math.random())
      const latest = h.length > 0 ? h[h.length - 1] : 0
      const attack = currentVolume > latest ? 0.85 : 0.35
      const smoothed = latest + (raw - latest) * attack
      h.push(Math.min(1, smoothed))
      if (h.length > COLS) h.shift()

      const len = h.length
      colHeightsRef.current = h.map((s, i) => {
        const age = i / Math.max(len - 1, 1)
        const envelope = 0.2 + age * 0.8
        return Math.max(0, s * envelope * 36)
      })

      frameCountRef.current++
      if (frameCountRef.current % 2 === 0) {
        setTick((n) => n + 1)
      }
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => {
      running = false
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const heights = colHeightsRef.current

  return (
    <div className="flex items-end h-9 w-full gap-0">
      {heights.map((h, i) => {
        const age = i / Math.max(heights.length - 1, 1)
        return (
          <div
            key={i}
            className="w-[2px] rounded-t-[1px] bg-accent/80"
            style={{
              height: `${h}px`,
              opacity: 0.3 + age * 0.7,
              transition: 'height 20ms linear',
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

export function AudioRecorder({ question, initialTranscript, onTranscriptChange, compact = false }: AudioRecorderProps) {
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

  const mainGap = compact ? 'gap-2' : 'gap-2.5'
  const questionClass = compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
  const textareaClass = compact ? 'px-2.5 py-1.5 text-xs rounded-md' : 'px-3 py-2 text-sm rounded-lg'
  const btnClass = compact
    ? 'h-7 px-3 text-[11px] rounded-md'
    : 'h-8 px-3.5 text-xs rounded-lg'
  const recClass = compact ? 'px-2 py-1.5 rounded-md gap-1.5' : 'px-3 py-2 rounded-lg gap-2'
  const dotClass = compact ? 'w-1.5 h-1.5' : 'w-2 h-2'
  const timerClass = compact ? 'text-[11px] min-w-[30px]' : 'text-xs min-w-[36px]'
  const stopClass = compact ? 'w-6 h-6' : 'w-7 h-7'
  const iconSize = compact ? 8 : 10

  return (
    <div className={`flex flex-col ${mainGap}`}>
      <p className={`${questionClass} font-semibold text-gray-900 leading-snug`}>{question}</p>

      <textarea
        ref={textareaRef}
        value={textContent}
        onChange={handleTextChange}
        placeholder="Escribe tu respuesta aquí..."
        rows={1}
        className={`w-full border border-[#ECECEC] ${textareaClass} text-gray-700 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent/20 leading-relaxed`}
        aria-label="Respuesta"
      />

      {showRecordButton && (
        <button
          type="button"
          onClick={handleStartRecording}
          aria-label="Empezar a grabar respuesta"
          className={`inline-flex items-center justify-center ${btnClass} font-medium transition-all duration-150 bg-accent text-white border border-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/30 gap-1.5 w-fit active:scale-[0.98]`}
        >
          <svg
            width="11"
            height="11"
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
          className={`flex items-center ${recClass} border border-[#ECECEC]`}
          role="status"
          aria-label="Grabación en curso"
        >
          <span className={`${dotClass} rounded-full bg-red-500 animate-pulse shrink-0`} />

          <span className={`${timerClass} tabular-nums text-gray-500 font-medium`}>
            {formatTime(elapsed)}
          </span>

          <div className="flex-1 flex items-center min-w-0 overflow-hidden">
            <VolumeVisualizer volume={volume} />
          </div>

          <button
            type="button"
            onClick={stopRecording}
            aria-label="Detener grabación"
            className={`shrink-0 ${stopClass} flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-300 active:scale-[0.92]`}
          >
            <svg
              width={iconSize}
              height={iconSize}
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
        <div className="flex items-center gap-2 animate-fade-in" role="status" aria-label="Analizando respuesta">
          <span className="w-3 h-3 rounded-full border-2 border-[#ECECEC] border-t-accent animate-spin" />
          <span className="text-xs text-gray-400">Analizando respuesta…</span>
        </div>
      )}
    </div>
  )
}
