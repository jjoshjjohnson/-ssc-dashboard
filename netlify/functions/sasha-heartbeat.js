// SASHA — Daily Heartbeat (scheduled function, see netlify.toml)
// Runs every morning with no human input: reads org memory, advances the top
// initiative one stage, updates context.md, and emails Josh a CEO brief.

const { _internals } = require('./sasha-chat.js');
const { TOOLS, executeTool, memoryRead, memoryWrite, sendEmail } = _internals;

const HEARTBEAT_PROMPT = `You are SASHA running your DAILY AUTONOMOUS CYCLE. Josh is not present — you are the whole organization working on its own. You have real tools; every action you take actually happens.

Your cycle, in order of priority:
1. Read sasha/memory/initiatives/INDEX.md and sasha/memory/context.md to see live org state
2. Pick the single highest-impact item: an initiative whose NEXT ACTION is due, or the resume point task
3. DO the work: delegate_to_department for the owning department's deliverable, write outputs into the initiative file, advance its stage and set the new NEXT ACTION line
4. Update sasha/memory/context.md — rewrite it as a tight org snapshot (what is live, what moved today, top 3 priorities, open Josh blockers). Keep it under 150 lines
5. Finish with a short CEO brief as your final text: what moved, what is next, what needs Josh. Plain text, no markdown

Rules:
- One meaningful advance per cycle beats five shallow ones
- Never invent data — use web_search, supabase_query, memory_read for facts
- If a tool returns a not-configured error, note it in the brief and move to work that does not need it
- Never touch anything outside the sasha/ directory`;

async function runHeartbeatLoop(apiKey) {
  const [index, ctx] = await Promise.all([
    memoryRead('sasha/memory/initiatives/INDEX.md'),
    memoryRead('sasha/memory/context.md')
  ]);
  const state = [
    index.error ? 'INITIATIVES INDEX: none yet — consider creating the first initiative from the top income stream.' : `INITIATIVES INDEX:\n${index.content}`,
    ctx.error ? '' : `ORG CONTEXT:\n${ctx.content}`
  ].filter(Boolean).join('\n\n');

  const messages = [{ role: 'user', content: `Daily cycle start — ${new Date().toISOString().slice(0, 10)}.\n\n${state}` }];
  const toolsUsed = [];

  for (let i = 0; i < 5; i++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1200, system: HEARTBEAT_PROMPT, tools: TOOLS, messages })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'API error');

    if (data.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: data.content });
      const calls = data.content.filter(b => b.type === 'tool_use');
      const results = await Promise.all(calls.map(async tc => {
        toolsUsed.push(tc.name);
        const result = await executeTool(tc.name, tc.input, apiKey);
        let content = JSON.stringify(result);
        if (content.length > 3000) content = content.substring(0, 3000) + '...[truncated]';
        return { type: 'tool_result', tool_use_id: tc.id, content };
      }));
      messages.push({ role: 'user', content: results });
      continue;
    }
    const brief = data.content.find(b => b.type === 'text')?.text || 'Cycle complete.';
    return { brief, toolsUsed };
  }
  return { brief: 'Cycle hit its step limit — progress saved to memory, next heartbeat continues.', toolsUsed };
}

exports.handler = async () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { statusCode: 200, body: 'ANTHROPIC_API_KEY not set — heartbeat skipped' };

  const date = new Date().toISOString().slice(0, 10);
  try {
    const { brief, toolsUsed } = await runHeartbeatLoop(apiKey);

    // Append to heartbeat log
    const log = await memoryRead('sasha/logs/heartbeat.md');
    const prior = log.error ? '# SASHA HEARTBEAT LOG\n' : log.content;
    const entry = `\n## ${date} ${new Date().toTimeString().slice(0, 5)}\nTools: ${toolsUsed.join(', ') || 'none'}\n${brief}\n`;
    await memoryWrite('sasha/logs/heartbeat.md', (prior + entry).slice(-12000), `heartbeat ${date}`);

    // CEO brief to Josh
    if (process.env.SASHA_EMAIL_WEBHOOK) {
      await sendEmail(
        process.env.CEO_EMAIL || 'jj.josh.jj@gmail.com',
        `SASHA daily brief — ${date}`,
        `${brief}\n\n— SASHA\nTools used this cycle: ${toolsUsed.join(', ') || 'none'}`
      );
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true, toolsUsed, brief: brief.substring(0, 400) }) };
  } catch (err) {
    try {
      const log = await memoryRead('sasha/logs/heartbeat.md');
      const prior = log.error ? '# SASHA HEARTBEAT LOG\n' : log.content;
      await memoryWrite('sasha/logs/heartbeat.md', (prior + `\n## ${date} — FAILED: ${err.message}\n`).slice(-12000), `heartbeat ${date} failed`);
    } catch {}
    return { statusCode: 200, body: JSON.stringify({ ok: false, error: err.message }) };
  }
};
