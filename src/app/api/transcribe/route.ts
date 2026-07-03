import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const { audio } = await request.json()
    if (!audio || typeof audio !== 'string') {
      return Response.json({ success: false, error: 'Missing audio payload' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ success: false, error: 'Gemini API key not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'audio/webm',
          data: audio,
        },
      },
      'Transcribe exactly what the person says in the original language. Return ONLY the transcription text, nothing else.',
    ])

    const text = result.response.text()
    if (!text) {
      return Response.json({ success: false, error: 'Empty transcription' }, { status: 502 })
    }

    return Response.json({ success: true, transcript: text.trim() })
  } catch (e: any) {
    console.error('Transcribe endpoint error:', e)
    return Response.json(
      { success: false, error: e?.message || 'Unexpected error' },
      { status: 500 },
    )
  }
}
