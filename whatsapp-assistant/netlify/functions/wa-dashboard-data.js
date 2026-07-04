const { selectRows } = require('./_lib');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const token = (event.queryStringParameters || {}).token;
  if (!process.env.DASHBOARD_TOKEN || token !== process.env.DASHBOARD_TOKEN) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const [messages, notes] = await Promise.all([
      selectRows('wa_messages', { limit: 200 }),
      selectRows('wa_notes', { limit: 100 })
    ]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.slice().reverse(),
        notes
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
