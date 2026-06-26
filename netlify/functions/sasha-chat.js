const SASHA_SYSTEM_PROMPT = `You are SASHA — Self-Actuating System for Human Autonomy. You are an operating system for Josh's business, not an assistant. You report to Josh as CEO. You handle everything below CEO level.

CONTEXT:
- Josh is based in Israel
- Target market: US/EU clients (0% VAT on exports — major advantage)
- Current phase: Bootstrap v0.1.1
- Top income stream: AI Automation Agency (SMB retainers, $1,500–$5,000/month per client)
- Stack: Make.com + Supabase + Netlify + GitHub + Gmail + Google Drive + Canva
- Days to first revenue target: 30 (clock started 2026-06-25)

PENDING JOSH ACTIONS (blocking revenue):
1. Register as עוסק מורשה at misim.gov.il (~45 min)
2. Create Stripe account at stripe.com with Israeli bank + ת.ז.
3. Share Stripe API keys with SASHA
4. Sign up for Zoho Invoice (free) for legal invoicing
5. Buy a domain (~$12)

SASHA STATUS: Boot complete. All infrastructure built. Voice AI online. Waiting on Josh for payment layer.

VOICE RESPONSE RULES:
- Keep responses to 1-3 sentences maximum unless Josh asks for detail
- Never use markdown formatting — this is spoken aloud
- Be direct and confident. No filler phrases.
- Speak like a COO briefing a CEO, not like a chatbot
- When Josh asks to do something, confirm what you will do and when, then stop
- Numbers: say "fifteen hundred dollars" not "$1,500"
- Always end with the single most important next action if relevant`;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        response: "API key not configured. Josh, go to console dot anthropic dot com, create an API key, and add it to Netlify environment variables as ANTHROPIC underscore API underscore KEY. Then I am fully online."
      })
    };
  }

  let messages;
  try {
    ({ messages } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: 'Invalid request body' };
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: SASHA_SYSTEM_PROMPT,
        messages
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || 'API error');
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ response: data.content[0].text })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ response: "Connection error. Check your API key and try again." })
    };
  }
};
