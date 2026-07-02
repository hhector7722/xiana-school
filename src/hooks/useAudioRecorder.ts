'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export type AudioStatus = 'idle' | 'recording' | 'transcribing' | 'done'

export function useAudioRecorder() {
  const [status, setStatus] = useState<AudioStatus>('idle')
  const [transcript, setTranscript] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [volume, setVolume] = useState<number>(0)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number>(0)

  function stopTracks() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }

  function cleanupAudio() {
    cancelAnimationFrame(animationRef.current)
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    analyserRef.current = null
    setVolume(0)
  }

  const startRecording = useCallback(async () => {
    chunks.current = []
    stopTracks()
    cleanupAudio()

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioContext = new AudioContext()
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 64
      analyser.smoothingTimeConstant = 0.85
      source.connect(analyser)

      const silentGain = audioContext.createGain()
      silentGain.gain.value = 0
      analyser.connect(silentGain)
      silentGain.connect(audioContext.destination)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.fftSize)

      function updateVolume() {
        if (!analyserRef.current) return
        analyserRef.current.getByteTimeDomainData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128
          sum += v * v
        }
        const rms = Math.sqrt(sum / dataArray.length)
        setVolume(Math.min(1, rms * 4))
        animationRef.current = requestAnimationFrame(updateVolume)
      }
      animationRef.current = requestAnimationFrame(updateVolume)

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : ''
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      mediaRecorder.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      recorder.onstop = async () => {
        cleanupAudio()
        const blob = new Blob(chunks.current, { type: recorder.mimeType || 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stopTracks()
        setStatus('transcribing')

        // Convert blob to base64 string
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = reader.result as string
            const b64 = result.split(',')[1]
            resolve(b64)
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })

        try {
          const resp = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64 }),
          })
          const result = await resp.json()
          if (result.success) {
            setTranscript(result.transcript)
          } else {
            console.error('Transcription error:', result.error)
            setTranscript('Error al transcribir el audio. Inténtalo de nuevo.')
          }
        } catch (e) {
          console.error('Transcription fetch error:', e)
          setTranscript('Error al transcribir el audio. Inténtalo de nuevo.')
        }

        setStatus('done')
      }

      recorder.start()
      setStatus('recording')
    } catch (err) {
      console.error('Recording error:', err)
      cleanupAudio()
      stopTracks()
      setStatus('idle')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop()
    }
  }, [])

  const reset = useCallback(() => {
    cleanupAudio()
    stopTracks()
    setStatus('idle')
    setTranscript(null)
    setAudioUrl(null)
    chunks.current = []
  }, [])

  useEffect(() => {
    return () => {
      try { cleanupAudio() } catch {}
      try { stopTracks() } catch {}
    }
  }, [])

  return { status, transcript, audioUrl, volume, startRecording, stopRecording, reset }
}
