import OpenAI from 'openai'

const MAX_FILE_SIZE = 25 * 1024 * 1024

const ALLOWED_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/aac',
  'audio/ogg',
  'audio/ogg;codecs=opus',
  'audio/wav',
  'audio/mpeg',
  'audio/flac',
  'video/webm',
  'video/mp4',
  'application/octet-stream',
]

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-2.5-flash-lite']

function isAllowedType(mime: string): boolean {
  if (!mime) return true
  const base = mime.split(';')[0].trim().toLowerCase()
  return ALLOWED_TYPES.some((t) => t.split(';')[0] === base) || base.startsWith('audio/')
}

function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const e = err as { status?: number; code?: string; message?: string }
  if (e.status === 429 || e.status === 402) return true
  const msg = (e.message ?? '').toLowerCase()
  return (
    msg.includes('insufficient_quota') ||
    msg.includes('exceeded your current quota') ||
    msg.includes('billing') ||
    msg.includes('quota') ||
    msg.includes('payment')
  )
}

async function transcribeWithOpenAI(file: File): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const transcription = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    language: 'es',
    file,
  })
  return transcription.text
}

async function transcribeWithGemini(file: File): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada')

  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const mimeType = (file.type || 'audio/webm').split(';')[0].trim()

  let lastError: unknown
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mimeType, data: base64 } },
                { text: 'Transcribe este audio en español. Devuelve SOLO el texto transcrito, sin comentarios ni formato adicional.' },
              ],
            },
          ],
          generationConfig: { temperature: 0.2 },
        }),
      })

      if (!res.ok) {
        const body = await res.text()
        if (res.status === 404 || body.toLowerCase().includes('not found')) {
          lastError = new Error(`Gemini ${model} no disponible`)
          continue
        }
        throw new Error(`Gemini ${model} ${res.status}: ${body}`)
      }

      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) throw new Error('Respuesta vacía de Gemini')
      return text.trim()
    } catch (err) {
      lastError = err
    }
  }
  throw lastError ?? new Error('Ningún modelo Gemini disponible')
}

export async function POST(request: Request) {
  try {
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return Response.json({ success: false, error: 'FormData inválido' }, { status: 400 })
    }

    const file = formData.get('file')
    if (!(file instanceof File)) {
      return Response.json({ success: false, error: 'Campo file requerido' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { success: false, error: 'Archivo demasiado grande (máx 25MB)' },
        { status: 400 },
      )
    }

    if (!isAllowedType(file.type)) {
      return Response.json(
        { success: false, error: `Tipo no soportado: ${file.type}` },
        { status: 400 },
      )
    }

    let transcript: string
    try {
      transcript = await transcribeWithOpenAI(file)
    } catch (err) {
      if (!isQuotaError(err)) throw err
      console.warn('[transcribe] OpenAI quota error, fallback a Gemini')
      transcript = await transcribeWithGemini(file)
    }

    return Response.json({ success: true, transcript })
  } catch (e: any) {
    console.error('[transcribe]', e)
    return Response.json(
      { success: false, error: e?.message || 'Error transcribiendo audio' },
      { status: 500 },
    )
  }
}
