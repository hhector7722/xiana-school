import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { audio } = req.body; // base64 string
    if (!audio) throw new Error('Missing audio payload');

    // Convert base64 to Buffer
    const audioBuffer = Buffer.from(audio, 'base64');

    // Prepare multipart form for OpenAI Whisper
    const form = new FormData();
    const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });
    form.append('file', audioFile);
    form.append('model', 'whisper-1');

    const openaiResp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        // Do NOT set Content-Type; let fetch add multipart boundary automatically
      },
      body: form,
    });

    if (!openaiResp.ok) {
      const errText = await openaiResp.text();
      console.error('OpenAI API error:', errText);
      return res.status(502).json({ success: false, error: `OpenAI error ${openaiResp.status}` });
    }

    const data = await openaiResp.json(); // Expected { text: string }
    if (data && typeof data.text === 'string') {
      return res.status(200).json({ success: true, transcript: data.text });
    }
    console.error('Unexpected OpenAI response format:', data);
    return res.status(502).json({ success: false, error: 'Invalid response from OpenAI' });
  } catch (e: any) {
    console.error('Transcribe endpoint error:', e);
    return res.status(500).json({ success: false, error: e?.message || 'Unexpected error' });
  }
}
