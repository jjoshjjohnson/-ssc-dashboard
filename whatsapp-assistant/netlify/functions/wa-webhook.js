const { insertRow, selectRows, callClaude, sendWhatsAppMessage, verifyMetaSignature } = require('./_lib');

const SYSTEM_PROMPT = `You are Josh's personal assistant, reachable over WhatsApp. Be helpful, direct, and concise — this is a text chat, not an essay. Use plain text (no markdown formatting, since WhatsApp doesn't render it). Keep replies short unless Josh clearly asks for something long-form (drafting, research, brainstorming).

You have access to notes Josh has explicitly asked you to remember (listed below, most recent first). Use them when relevant. If none are listed, you have no saved notes yet.`;

function extractRememberText(text) {
  const match = text.match(/^\s*remember(?:\s+that)?\s*:?\s*(.+)/is);
  return match ? match[1].trim() : null;
}

async function handleIncomingMessage(from, text) {
  await insertRow('wa_messages', { wa_from: from, direction: 'in', body: text });

  const rememberText = extractRememberText(text);
  if (rememberText) {
    await insertRow('wa_notes', { content: rememberText });
    const reply = `Got it, I'll remember: ${rememberText}`;
    await insertRow('wa_messages', { wa_from: from, direction: 'out', body: reply });
    await sendWhatsAppMessage(from, reply);
    return;
  }

  const [notes, history] = await Promise.all([
    selectRows('wa_notes', { limit: 50 }),
    selectRows('wa_messages', { limit: 20 })
  ]);

  const notesBlock = notes.length
    ? notes.map(n => `- ${n.content}`).join('\n')
    : '(none yet)';

  const conversationHistory = history
    .slice()
    .reverse()
    .slice(0, -1) // drop the message we just inserted; it's re-added below as the latest turn
    .map(m => ({ role: m.direction === 'in' ? 'user' : 'assistant', content: m.body }));

  const messages = [...conversationHistory, { role: 'user', content: text }];

  let reply;
  try {
    reply = await callClaude(`${SYSTEM_PROMPT}\n\nSAVED NOTES:\n${notesBlock}`, messages);
  } catch (err) {
    reply = 'Something went wrong on my end reaching Claude — try again in a moment.';
  }

  await insertRow('wa_messages', { wa_from: from, direction: 'out', body: reply });
  await sendWhatsAppMessage(from, reply);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters || {};
    const mode = params['hub.mode'];
    const token = params['hub.verify_token'];
    const challenge = params['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return { statusCode: 200, body: challenge };
    }
    return { statusCode: 403, body: 'Forbidden' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const rawBody = event.body || '';
  const signatureValid = await verifyMetaSignature(rawBody, event.headers['x-hub-signature-256'] || event.headers['X-Hub-Signature-256']);
  if (!signatureValid) {
    return { statusCode: 403, body: 'Invalid signature' };
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { statusCode: 400, body: 'Bad request' };
  }

  try {
    const entries = payload.entry || [];
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        const messages = change.value?.messages || [];
        for (const msg of messages) {
          if (msg.type !== 'text') continue;
          await handleIncomingMessage(msg.from, msg.text.body);
        }
      }
    }
  } catch (err) {
    console.error('wa-webhook error:', err);
  }

  // Meta requires a fast 200 regardless of internal outcome, or it will retry/backoff the webhook.
  return { statusCode: 200, body: 'OK' };
};
