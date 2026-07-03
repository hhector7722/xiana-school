import { GoogleGenerativeAI } from '@google/generative-ai'

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

    const apiKey = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ success: false, error: 'Gemini API key not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mimeType = (file.type || 'audio/webm').split(';')[0].trim()

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Transcribe este audio en español. Devuelve SOLO el texto transcrito, sin comentarios ni formato adicional.' },
            {
              inlineData: { mimeType, data: base64 },
            },
          ],
        },
      ],
    })

    const text = result.response.text()
    if (!text) {
      return Response.json({ success: false, error: 'Empty transcription' }, { status: 502 })
    }

    return Response.json({ success: true, transcript: text.trim() })
  } catch (e: any) {
    console.error('[transcribe]', e)
    return Response.json({ success: false, error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
