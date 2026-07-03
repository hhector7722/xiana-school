async function transcribeWithGemini(file: File): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) throw new Error('Gemini API key not configured')

  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const mimeType = file.type || 'audio/webm'

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
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
      }),
    },
  )

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini error ${res.status}: ${errText}`)
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response from Gemini')
  return text.trim()
}

export async function POST(request: Request) {
  try {
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return Response.json({ success: false, error: 'Invalid FormData' }, { status: 400 })
    }

    const file = formData.get('file')
    if (!(file instanceof File)) {
      return Response.json({ success: false, error: 'File field required' }, { status: 400 })
    }

    const transcript = await transcribeWithGemini(file)
    return Response.json({ success: true, transcript })
  } catch (e: any) {
    console.error('[transcribe]', e)
    return Response.json({ success: false, error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
