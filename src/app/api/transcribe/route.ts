export async function POST(request: Request) {
  try {
    const { audio } = await request.json()
    if (!audio || typeof audio !== 'string') {
      return Response.json({ success: false, error: 'Missing audio payload' }, { status: 400 })
    }

    const audioBuffer = Buffer.from(audio, 'base64')

    const form = new FormData()
    const blob = new Blob([audioBuffer], { type: 'audio/webm' })
    form.append('file', blob, 'audio.webm')
    form.append('model', 'whisper-1')

    const openaiResp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: form,
    })

    if (!openaiResp.ok) {
      const errText = await openaiResp.text()
      console.error('OpenAI API error:', openaiResp.status, errText)
      return Response.json(
        { success: false, error: `OpenAI error ${openaiResp.status}` },
        { status: 502 },
      )
    }

    const data = await openaiResp.json()
    if (data && typeof data.text === 'string') {
      return Response.json({ success: true, transcript: data.text })
    }

    console.error('Unexpected OpenAI response format:', data)
    return Response.json({ success: false, error: 'Invalid response from OpenAI' }, { status: 502 })
  } catch (e: any) {
    console.error('Transcribe endpoint error:', e)
    return Response.json(
      { success: false, error: e?.message || 'Unexpected error' },
      { status: 500 },
    )
  }
}
