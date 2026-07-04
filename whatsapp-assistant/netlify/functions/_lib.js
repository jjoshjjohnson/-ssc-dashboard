// Shared helpers for the WhatsApp assistant functions.

function supabaseHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json'
  };
}

async function insertRow(table, row) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...supabaseHeaders(), Prefer: 'return=minimal' },
    body: JSON.stringify(row)
  });
  if (!res.ok) throw new Error(`Supabase insert into ${table} failed: ${res.status} ${await res.text()}`);
}

async function selectRows(table, { order = 'created_at.desc', limit = 50 } = {}) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/${table}?select=*&order=${order}&limit=${limit}`;
  const res = await fetch(url, { headers: supabaseHeaders() });
  if (!res.ok) throw new Error(`Supabase select from ${table} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function callClaude(system, messages, maxTokens = 500) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: maxTokens,
      system,
      messages
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Anthropic API error');
  return data.content[0].text;
}

async function sendWhatsAppMessage(to, body) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body }
    })
  });
  if (!res.ok) throw new Error(`WhatsApp send failed: ${res.status} ${await res.text()}`);
}

// Verifies Meta's X-Hub-Signature-256 header against the raw request body.
async function verifyMetaSignature(rawBody, signatureHeader) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return true; // not configured yet — allow, but this should be set before going live
  if (!signatureHeader) return false;

  const crypto = require('crypto');
  const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');

  if (expected.length !== signatureHeader.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}

module.exports = { insertRow, selectRows, callClaude, sendWhatsAppMessage, verifyMetaSignature };
