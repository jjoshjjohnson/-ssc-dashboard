// SASHA — Groq Whisper transcription endpoint
// Receives base64 audio from browser, returns transcript text

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ error: 'GROQ_API_KEY not configured in Netlify environment variables', text: '' })
    };
  }

  let audio, mimeType;
  try {
    ({ audio, mimeType } = JSON.parse(event.body));
    if (!audio) throw new Error('No audio');
  } catch {
    return { statusCode: 400, body: 'Invalid request body' };
  }

  try {
    const audioBuffer = Buffer.from(audio, 'base64');
    const ext = mimeType && mimeType.includes('mp4') ? 'mp4' : 'webm';

    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' });
    formData.append('file', blob, `audio.${ext}`);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('response_format', 'json');
    formData.append('language', 'en');

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `Groq API error ${res.status}`);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ text: data.text || '' })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ error: err.message, text: '' })
    };
  }
};
