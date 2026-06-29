// SASHA — Autonomous Agent OS
// Pipeline: USER → MANAGEMENT (classify) → AGENTIC LOOP (tools) → SECURITY → QA → OUTPUT
// Tools: Make.com · Supabase · GitHub memory · Web search

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// ── BASE IDENTITY ─────────────────────────────────────────────────────────────
const BASE_IDENTITY = `You are SASHA — Self-Actuating System for Human Autonomy. You are an operating system for Josh's business, not a chatbot. You report only to Josh as CEO.

CONTEXT:
- Josh is based in Israel
- Target market: US and EU clients (0% VAT on exports — major profit advantage)
- Phase: Bootstrap — Day ${Math.floor((Date.now() - new Date('2026-06-25').getTime()) / 86400000)} of 30-day revenue target
- Primary income stream: AI Automation Agency (SMB retainers, fifteen hundred to five thousand USD per month)
- Stack: Make.com, Supabase, Netlify, GitHub, Gmail, Google Drive, Canva

BLOCKING ACTIONS (required before first revenue):
1. Register as עוסק מורשה at misim.gov.il
2. Create Stripe account (Israel) with Israeli bank + ת.ז.
3. Share Stripe API keys with SASHA
4. Sign up for Zoho Invoice (free) for legal invoicing
5. Purchase a domain (approximately twelve dollars)

AUTONOMY — CRITICAL:
You have tools. When Josh asks you to do something, DO IT — don't describe what you would do. Use tools to take real actions now.
- "List our scenarios" → call make_list_scenarios, report what you find
- "Activate the X workflow" → call make_activate_scenario with the ID
- "Save this lead" → call supabase_insert into leads table
- "What's in our pipeline?" → call supabase_query on leads or campaigns
- "Research [company]" → call web_search to find real information
- "Log this decision" → call memory_write to sasha/memory/decisions.md
- "How are you doing?" / "What's working?" → call self_audit to analyze your own performance
- "Send [person] an email about X" → call send_email — sends from os.sasha.ai@gmail.com
Never say "I would do X" when you can just do X.

CONVERSATION STYLE:
You are Josh's sharpest, most trusted advisor. Smooth, calm, confident. Never formal, never robotic.
- 2-3 sentences max for spoken responses. No markdown, no bullets, no asterisks
- Numbers spoken naturally: "fifteen hundred dollars" not "$1,500"
- When you take an action: one sentence confirming what you did, then stop
- Never start with "Certainly", "Of course", "Absolutely", "Sure"
- Warm and direct — like a brilliant friend who actually gets things done`;

// ── DOMAIN PROMPTS ────────────────────────────────────────────────────────────
const DOMAIN_PROMPTS = {
  operations: `You handle Make.com automations, Supabase, Netlify, GitHub. USE make_list_scenarios to check real scenario state before reporting. Activate scenarios when asked. Log significant actions to memory.`,

  finance: `You handle revenue, costs, margins, cash flow, Israeli tax, Stripe events, P&L. USE supabase_query on transactions table for real numbers. Zero revenue pre-Stripe. 0% VAT on US/EU exports is the margin advantage.`,

  growth: `You handle client acquisition, outreach, lead pipeline. USE supabase_query to check existing leads, supabase_insert to save new ones, web_search to research target companies. Fastest path to revenue: build a real lead list now.`,

  content: `You handle marketing copy, proposals, email sequences, social posts. Write the actual content in your response. Use memory_write to save important drafts. All content targets US/EU English-speaking SMB decision-makers.`,

  sales: `You handle client pipeline, proposals, pricing, deal flow. USE supabase_query to check pipeline status. Use supabase_insert to log new deals. Standard pricing: discovery (free), audit (five hundred dollars), retainer (fifteen hundred to five thousand per month).`,

  client_success: `You handle client onboarding, delivery, satisfaction, renewal, upsell. USE supabase_query for client status. UPDATE records when milestones hit. No clients yet — design the onboarding workflow ready for first client.`,

  legal: `You handle Israeli compliance, contracts, GDPR, privacy. SASHA flags issues but never gives binding legal advice — always recommend Josh consult an Israeli attorney (עורך דין). עוסק מורשה registration is legally required before invoicing.`,

  strategic: `You handle business direction, income stream ranking, positioning, thirty sixty ninety day planning. USE memory_read to check current strategic context. USE memory_write to log decisions after major calls. First retainer before any pivot.`,

  rnd: `You handle market research, income model evaluation, competitive landscape. USE web_search for real market data. USE memory_read on sasha/memory/income_streams.md for current rankings. Write new findings to memory.`,

  monitor: `You handle platform health, agent performance, anomaly detection. USE make_list_scenarios to check real scenario state. USE supabase_query to verify data is flowing. Report what is actually running vs what should be.`,

  it: `You handle infrastructure diagnostics, deployment issues, Netlify, GitHub, Supabase health, Make.com errors. USE make_list_scenarios to check scenario state. Diagnose first, fix where tools allow, escalate only what needs Josh's credentials.`,

  marketing: `You handle brand strategy, ICP, advertising strategy, LinkedIn, SEO, email marketing. Target US/EU SMB decision-makers. USE web_search to research competitors or ICP. USE memory_write to save brand docs. No paid ads until first retainer.`,

  campaign: `You handle campaign creation, launch, tracking, optimization. Campaign one: cold email to fifty SMB targets. USE make_list_scenarios to check campaign scenario status. USE supabase_query for campaign metrics. Save campaign records to Supabase.`,

  media: `You handle visual production. Canva MCP is not available inside this function. Describe the design brief clearly and queue the task — Josh or a future session will execute it in Canva.`,

  general: `Handle this using full SASHA context. Use tools if real data or real action would help the response.`
};

// ── MANAGEMENT CLASSIFIER ─────────────────────────────────────────────────────
const MANAGEMENT_CLASSIFIER = `You are SASHA's Management Agent. Classify and route incoming messages.

Departments: operations, finance, growth, content, sales, client_success, legal, strategic, rnd, monitor, it, marketing, campaign, media, general

Rules:
- Respond with ONLY valid JSON on a single line: {"department":"<dept>","intent":"<2-5 word description>","priority":"normal|urgent"}
- "urgent" only if Josh explicitly signals urgency or there is a system failure
- Greetings, status checks → general
- Build/deploy/automate → operations
- Revenue/money/tax/costs → finance
- Find clients/outreach/pipeline → growth
- Write copy/email/page → content
- Proposals/pricing/deals → sales
- Client onboarding/retention → client_success
- Legal/compliance/contracts → legal
- Strategy/direction/planning → strategic
- Research/market/competitors → rnd
- Health check/monitoring/optimize → monitor
- Infrastructure/deployment/errors/broken/fix/debug → it
- Brand/positioning/advertising/social → marketing
- Campaign/outreach tracking/A-B test → campaign
- Design/visual/Canva/graphics → media`;

// ── QA PROMPT ─────────────────────────────────────────────────────────────────
const QA_PROMPT = `You are SASHA's QA Agent. Your output is ONLY the final spoken response — nothing else.

CRITICAL: Do NOT write critique, commentary, headers, ratings, or analysis. Output the response text only.

Fix these issues if present, then output the corrected text:
1. Remove markdown (asterisks, headers, bullet points, dashes) — plain spoken English only
2. Trim to max 3 sentences — cut filler, keep substance
3. Spell out numbers ("fifteen hundred", not "$1,500")
4. Remove filler openers: "Certainly", "Of course", "Absolutely", "Great question", "Sure", "Got it"
5. Strip robotic phrases: "Agent Active", "Pipeline", "Routing", "Processing complete", "Noted", "Understood"
6. Sound smooth and warm — like a trusted advisor talking to a friend, not a status report

If the response already passes all criteria, output it unchanged.
Output the response text directly. First word is the response. No labels, no preamble.`;

// ── SECURITY SCAN ─────────────────────────────────────────────────────────────
function securityScan(text) {
  const blockedPatterns = [
    /sk-ant-api/i,
    /anthropic_api_key/i,
    /process\.env\./i,
    /bearer\s+[a-z0-9]{20,}/i,
    /password\s*[:=]\s*\S+/i,
  ];
  for (const pattern of blockedPatterns) {
    if (pattern.test(text)) {
      return { safe: false, sanitized: 'Response withheld by Security Agent. Potential sensitive data detected.' };
    }
  }
  if (text.length > 1200) {
    return { safe: true, sanitized: text.substring(0, 1200).trim() + '... Response truncated for voice output.' };
  }
  return { safe: true, sanitized: text };
}

// ── TOOL DEFINITIONS ──────────────────────────────────────────────────────────
const TOOLS = [
  {
    name: 'make_list_scenarios',
    description: 'List all Make.com automation scenarios with IDs, names, and enabled status.',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'make_activate_scenario',
    description: 'Activate (turn on) a Make.com scenario by ID so it runs on its schedule.',
    input_schema: {
      type: 'object',
      properties: { scenario_id: { type: 'integer', description: 'Scenario ID from make_list_scenarios' } },
      required: ['scenario_id']
    }
  },
  {
    name: 'make_run_scenario',
    description: 'Manually trigger a Make.com scenario to run right now.',
    input_schema: {
      type: 'object',
      properties: { scenario_id: { type: 'integer' } },
      required: ['scenario_id']
    }
  },
  {
    name: 'make_trigger_webhook',
    description: 'POST data to a Make.com webhook to trigger an automation (email send, data processing, etc.).',
    input_schema: {
      type: 'object',
      properties: {
        webhook_url: { type: 'string', description: 'Make.com webhook URL' },
        data: { type: 'object', description: 'Payload to send' }
      },
      required: ['webhook_url', 'data']
    }
  },
  {
    name: 'supabase_query',
    description: 'Read data from Supabase. Use to check clients, leads, campaigns, transactions.',
    input_schema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table: clients, leads, campaigns, campaign_contacts, transactions' },
        select: { type: 'string', description: 'Columns to return, default *' },
        filter: { type: 'string', description: 'PostgREST filter e.g. status=eq.active' },
        limit: { type: 'integer', description: 'Max rows, default 20' }
      },
      required: ['table']
    }
  },
  {
    name: 'supabase_insert',
    description: 'Insert a new record into Supabase (add a lead, client, campaign, transaction).',
    input_schema: {
      type: 'object',
      properties: {
        table: { type: 'string' },
        data: { type: 'object', description: 'Record fields and values' }
      },
      required: ['table', 'data']
    }
  },
  {
    name: 'supabase_update',
    description: 'Update existing records in Supabase.',
    input_schema: {
      type: 'object',
      properties: {
        table: { type: 'string' },
        filter: { type: 'string', description: 'PostgREST filter e.g. id=eq.5' },
        data: { type: 'object', description: 'Fields to update' }
      },
      required: ['table', 'filter', 'data']
    }
  },
  {
    name: 'web_search',
    description: 'Search the web. Use to research prospects, competitors, market data, company info.',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Search query' } },
      required: ['query']
    }
  },
  {
    name: 'memory_read',
    description: 'Read a SASHA memory or config file from the repository.',
    input_schema: {
      type: 'object',
      properties: { file: { type: 'string', description: 'Path under sasha/, e.g. sasha/memory/decisions.md or sasha/STATUS.md' } },
      required: ['file']
    }
  },
  {
    name: 'memory_write',
    description: 'Write or update a SASHA memory file. Log decisions, record actions, update STATUS.md.',
    input_schema: {
      type: 'object',
      properties: {
        file: { type: 'string', description: 'Path under sasha/, e.g. sasha/memory/decisions.md' },
        content: { type: 'string', description: 'Full file content to write' },
        message: { type: 'string', description: 'Commit message' }
      },
      required: ['file', 'content', 'message']
    }
  },
  {
    name: 'self_audit',
    description: 'Analyze your own recent performance across conversations. Call when Josh asks how you are performing, what is working, or when you want to self-improve before tackling a complex task.',
    input_schema: {
      type: 'object',
      properties: {
        focus: { type: 'string', description: 'What to analyze: "tools", "accuracy", "response_quality", or "overall"' }
      },
      required: []
    }
  },
  {
    name: 'send_email',
    description: 'Send an email from SASHA (os.sasha.ai@gmail.com). Use for client outreach, proposals, follow-ups, or any email Josh asks SASHA to send.',
    input_schema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Email subject line' },
        body: { type: 'string', description: 'Email body — plain text or HTML' }
      },
      required: ['to', 'subject', 'body']
    }
  }
];

// ── TOOL EXECUTORS ────────────────────────────────────────────────────────────
async function makeRequest(path, method = 'GET', body) {
  const apiKey = process.env.MAKE_API_KEY;
  if (!apiKey) return { error: 'MAKE_API_KEY not configured — add it to Netlify env vars to control Make.com directly' };
  const base = process.env.MAKE_BASE_URL || 'https://eu1.make.com/api/v2';
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'Authorization': `Token ${apiKey}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.message || `Make.com error ${res.status}` };
  return data;
}

async function makeListScenarios() {
  const teamId = process.env.MAKE_TEAM_ID;
  const qs = teamId ? `?teamId=${teamId}&pg[limit]=100` : '?pg[limit]=100';
  const data = await makeRequest(`/scenarios${qs}`);
  if (data.error) return data;
  return { scenarios: (data.scenarios || []).map(s => ({ id: s.id, name: s.name, isEnabled: s.isEnabled, nextExec: s.nextExec })) };
}

async function makeActivateScenario(id) {
  const data = await makeRequest(`/scenarios/${id}`, 'PATCH', { isEnabled: true });
  if (data.error) return data;
  return { success: true, id: data.scenario?.id, name: data.scenario?.name, isEnabled: data.scenario?.isEnabled };
}

async function makeRunScenario(id) {
  const data = await makeRequest(`/scenarios/${id}/run`, 'POST');
  if (data.error) return data;
  return { success: true, executionId: data.executionId };
}

async function makeTriggerWebhook(url, payload) {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const text = await res.text();
    return res.ok ? { success: true, response: text } : { error: `Webhook ${res.status}: ${text}` };
  } catch (e) { return { error: e.message }; }
}

async function supabaseRequest(path, method = 'GET', body) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return { error: 'SUPABASE_URL or SUPABASE_SERVICE_KEY not configured — add them to Netlify env vars to enable database access' };
  const res = await fetch(`${url}/rest/v1${path}`, {
    method,
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.message || `Supabase error ${res.status}` };
  return data;
}

async function supabaseQuery(table, select = '*', filter, limit = 20) {
  let path = `/${table}?select=${select}&limit=${limit}`;
  if (filter) path += `&${filter}`;
  const data = await supabaseRequest(path);
  if (data.error) return data;
  return { rows: data, count: Array.isArray(data) ? data.length : 0 };
}

async function supabaseInsert(table, record) {
  const data = await supabaseRequest(`/${table}`, 'POST', record);
  if (data.error) return data;
  return { success: true, inserted: data };
}

async function supabaseUpdate(table, filter, updates) {
  const data = await supabaseRequest(`/${table}?${filter}`, 'PATCH', updates);
  if (data.error) return data;
  return { success: true, updated: data };
}

async function webSearch(query) {
  const key = process.env.SERPER_API_KEY;
  if (!key) return { error: 'SERPER_API_KEY not configured — sign up free at serper.dev (two thousand five hundred searches per month free) and add to Netlify env vars' };
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 5 })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: 'Search failed' };
  return { results: (data.organic || []).slice(0, 5).map(r => ({ title: r.title, snippet: r.snippet, link: r.link })) };
}

async function memoryRead(filePath) {
  if (!filePath.startsWith('sasha/')) return { error: 'Memory reads restricted to sasha/ directory' };
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'jjoshjjohnson/-ssc-dashboard';
  if (!token) return { error: 'GITHUB_TOKEN not configured — add a GitHub PAT to Netlify env vars to enable file memory' };
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}?ref=claude/new-repository-bap65s`, {
    headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3.raw', 'User-Agent': 'SASHA-OS' }
  });
  if (!res.ok) return { error: `File not found: ${filePath}` };
  const content = await res.text();
  return { content: content.substring(0, 4000), path: filePath };
}

async function memoryWrite(filePath, content, message) {
  if (!filePath.startsWith('sasha/')) return { error: 'Memory writes restricted to sasha/ directory' };
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'jjoshjjohnson/-ssc-dashboard';
  if (!token) return { error: 'GITHUB_TOKEN not configured — add a GitHub PAT to Netlify env vars' };
  let sha;
  try {
    const g = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}?ref=claude/new-repository-bap65s`, {
      headers: { 'Authorization': `token ${token}`, 'User-Agent': 'SASHA-OS' }
    });
    if (g.ok) { const d = await g.json(); sha = d.sha; }
  } catch {}
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'SASHA-OS' },
    body: JSON.stringify({ message, content: Buffer.from(content, 'utf8').toString('base64'), branch: 'claude/new-repository-bap65s', ...(sha ? { sha } : {}) })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.message || 'GitHub write failed' };
  return { success: true, path: filePath };
}

async function selfAudit(apiKey, focus = 'overall') {
  const reflectionsResult = await memoryRead('sasha/memory/reflections.jsonl');
  if (reflectionsResult.error || !reflectionsResult.content?.trim()) {
    return { status: 'no_data', message: 'No reflection history yet. Check back after a few more conversations.' };
  }
  const lines = reflectionsResult.content.trim().split('\n').filter(Boolean);
  const recent = lines.slice(-15);
  const text = await callClaude(
    apiKey,
    'You are a performance analysis system. Output valid JSON only, no other text.',
    [{
      role: 'user',
      content: `Analyze these SASHA performance reflections. Focus: ${focus}.
${recent.join('\n')}
Output JSON: {"score":N,"strengths":["..."],"gaps":["..."],"recommendation":"one clear next action"} where N is 1-10.`
    }],
    300
  );
  try {
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
    return { ...parsed, reflections_analyzed: recent.length };
  } catch { return { insight: text, reflections_analyzed: recent.length }; }
}

async function writeReflection(apiKey, userMessage, response, toolsUsed, routing) {
  if (!process.env.GITHUB_TOKEN) return;
  try {
    const scoreRaw = await callClaude(
      apiKey,
      'Output one JSON object only, no other text.',
      [{
        role: 'user',
        content: `Score this SASHA interaction.
Dept: ${routing.department} | Tools used: ${toolsUsed.join(',') || 'none'}
User: "${userMessage.substring(0, 80)}"
Response: "${response.substring(0, 150)}"
Output exactly: {"ts":"${new Date().toISOString()}","dept":"${routing.department}","tools":${JSON.stringify(toolsUsed)},"completion":N,"quality":N,"note":"one_word"}
N = 1-10. completion = did response address request. quality = smoothness/accuracy.`
      }],
      100
    );
    const jsonMatch = scoreRaw.match(/\{[^}]+\}/);
    if (!jsonMatch) return;
    const existing = await memoryRead('sasha/memory/reflections.jsonl');
    const lines = existing.error ? [] : existing.content.trim().split('\n').filter(Boolean);
    lines.push(jsonMatch[0]);
    await memoryWrite('sasha/memory/reflections.jsonl', lines.slice(-50).join('\n') + '\n', 'SASHA self-reflection');
  } catch {}
}

async function sendEmail(to, subject, body) {
  const webhookUrl = process.env.SASHA_EMAIL_WEBHOOK;
  if (!webhookUrl) return { error: 'SASHA_EMAIL_WEBHOOK not configured in Netlify env vars' };
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body })
    });
    const text = await res.text();
    return res.ok ? { success: true, to, subject } : { error: `Email send failed ${res.status}: ${text}` };
  } catch (e) { return { error: e.message }; }
}

async function executeTool(name, input, apiKey) {
  try {
    switch (name) {
      case 'make_list_scenarios': return await makeListScenarios();
      case 'make_activate_scenario': return await makeActivateScenario(input.scenario_id);
      case 'make_run_scenario': return await makeRunScenario(input.scenario_id);
      case 'make_trigger_webhook': return await makeTriggerWebhook(input.webhook_url, input.data || {});
      case 'supabase_query': return await supabaseQuery(input.table, input.select, input.filter, input.limit);
      case 'supabase_insert': return await supabaseInsert(input.table, input.data);
      case 'supabase_update': return await supabaseUpdate(input.table, input.filter, input.data);
      case 'web_search': return await webSearch(input.query);
      case 'memory_read': return await memoryRead(input.file);
      case 'memory_write': return await memoryWrite(input.file, input.content, input.message || 'SASHA memory update');
      case 'send_email': return await sendEmail(input.to, input.subject, input.body);
      case 'self_audit': return await selfAudit(apiKey, input.focus || 'overall');
      default: return { error: `Unknown tool: ${name}` };
    }
  } catch (err) { return { error: err.message }; }
}

// ── ANTHROPIC CALL (no tools — for management + QA) ──────────────────────────
async function callClaude(apiKey, system, messages, maxTokens = 300) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: maxTokens, system, messages })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'API error');
  return data.content[0].text;
}

// ── AGENTIC LOOP ──────────────────────────────────────────────────────────────
async function runAgenticLoop(apiKey, userMessage, conversationHistory, routing) {
  const domainContext = DOMAIN_PROMPTS[routing.department] || DOMAIN_PROMPTS.general;
  const system = `${BASE_IDENTITY}\n\n${domainContext}`;
  const messages = [...conversationHistory, { role: 'user', content: userMessage }];
  const toolsUsed = [];
  const MAX_ITER = 4;

  for (let i = 0; i < MAX_ITER; i++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, system, tools: TOOLS, messages })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'API error');

    if (data.stop_reason === 'end_turn' || data.stop_reason === 'max_tokens') {
      const text = data.content.find(b => b.type === 'text')?.text || '';
      return { response: text, toolsUsed };
    }

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

    const text = data.content.find(b => b.type === 'text')?.text || 'Done.';
    return { response: text, toolsUsed };
  }

  return { response: 'Task underway — I hit my step limit for one turn. Tell me to continue and I will pick up where I left off.', toolsUsed };
}

// ── PIPELINE ──────────────────────────────────────────────────────────────────
async function runPipeline(apiKey, userMessage, conversationHistory) {
  const userMsg = [{ role: 'user', content: userMessage }];

  // STEP 1: Management — classify and route
  let routing = { department: 'general', intent: 'general query', priority: 'normal' };
  try {
    const classifyResponse = await callClaude(apiKey, MANAGEMENT_CLASSIFIER, userMsg, 100);
    const jsonMatch = classifyResponse.match(/\{[^}]+\}/s);
    const parsed = JSON.parse((jsonMatch ? jsonMatch[0] : classifyResponse).trim());
    if (parsed.department && DOMAIN_PROMPTS[parsed.department]) routing = parsed;
  } catch {}

  // STEP 2: Agentic Loop — domain agent with real tools
  const { response: draftResponse, toolsUsed } = await runAgenticLoop(apiKey, userMessage, conversationHistory, routing);

  // STEP 3: Security Scan — inline, no API call
  const secCheck = securityScan(draftResponse);
  if (!secCheck.safe) {
    return { response: secCheck.sanitized, meta: { ...routing, qa: 'security_block', toolsUsed } };
  }

  // STEP 4: QA Agent — validate and polish
  let finalResponse = secCheck.sanitized;
  try {
    const qaMessages = [{ role: 'user', content: `User said: "${userMessage}"\n\nDraft response:\n${secCheck.sanitized}` }];
    let qaRaw = await callClaude(apiKey, QA_PROMPT, qaMessages, 300);
    const critiqueMarkers = [
      /^(here is|here's|the corrected|corrected response|final response)[^:]*:/i,
      /^(i need to stop|this response fails|qa (notes?|review|check)|criteria\s*\d)/i
    ];
    for (const marker of critiqueMarkers) {
      if (marker.test(qaRaw.trim())) { qaRaw = secCheck.sanitized; break; }
    }
    finalResponse = securityScan(qaRaw).sanitized;
  } catch {}

  // STEP 5: Self-reflection — score this interaction and write to memory
  // Capped at 2s so it never delays the response. Skipped silently if GITHUB_TOKEN absent.
  await Promise.race([
    writeReflection(apiKey, userMessage, finalResponse, toolsUsed, routing),
    new Promise(resolve => setTimeout(resolve, 2000))
  ]);

  return {
    response: finalResponse,
    meta: { ...routing, pipeline: 'management→agentic→security→qa→reflect', toolsUsed }
  };
}

// ── HANDLER ───────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        response: 'API key not configured. Josh, add ANTHROPIC_API_KEY to Netlify environment variables.',
        meta: { department: 'general', pipeline: 'offline' }
      })
    };
  }

  let messages, userMessage;
  try {
    ({ messages } = JSON.parse(event.body));
    userMessage = messages[messages.length - 1]?.content || '';
    if (!userMessage.trim()) throw new Error('Empty message');
  } catch {
    return { statusCode: 400, body: 'Invalid request body' };
  }

  const conversationHistory = messages.slice(0, -1);

  try {
    const result = await runPipeline(apiKey, userMessage, conversationHistory);
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify(result) };
  } catch (err) {
    const isAuthError = err.message?.includes('auth') || err.message?.includes('key');
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        response: isAuthError
          ? 'Authentication error — the API key may be invalid or expired. Check Netlify environment variables.'
          : 'Something went wrong on my end. Try again in a moment.',
        meta: { error: err.message, pipeline: 'failed' }
      })
    };
  }
};
