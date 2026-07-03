import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  try {
    const { audio } = await request.json()
    if (!audio || typeof audio !== 'string') {
      return Response.json({ success: false, error: 'Missing audio payload' }, { status: 400 })
    }

    const audioBuffer = Buffer.from(audio, 'base64')
    const file = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' })

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    })

    return Response.json({ success: true, transcript: transcription.text })
  } catch (e: any) {
    console.error('Transcribe endpoint error:', e)
    return Response.json(
      { success: false, error: e?.message || 'Unexpected error' },
      { status: 500 },
    )
  }
}
