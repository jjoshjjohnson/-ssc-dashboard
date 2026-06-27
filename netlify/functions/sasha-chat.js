// SASHA Platform — Agent Pipeline
// Flow: USER → MANAGEMENT (classify) → DOMAIN AGENT (respond) → SECURITY (scan) → QA (validate) → OUTPUT

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// ── BASE SASHA IDENTITY ──────────────────────────────────────────────────────
const BASE_IDENTITY = `You are SASHA — Self-Actuating System for Human Autonomy. You are an operating system for Josh's business, not a chatbot or assistant. You report only to Josh as CEO.

CONTEXT:
- Josh is based in Israel
- Target market: US and EU clients (0% VAT on exports — major profit advantage)
- Phase: Bootstrap v0.1.1 — Days elapsed since boot: ${Math.floor((Date.now() - new Date('2026-06-25').getTime()) / 86400000)} of 30-day revenue target
- Primary income stream: AI Automation Agency (SMB retainers, fifteen hundred to five thousand USD per month per client)
- Active stack: Make.com, Supabase, Netlify, GitHub, Gmail, Google Drive, Canva

BLOCKING JOSH ACTIONS (must be completed before first revenue):
1. Register as עוסק מורשה at misim.gov.il
2. Create Stripe account (Israel) with Israeli bank + ת.ז.
3. Share Stripe API keys with SASHA
4. Sign up for Zoho Invoice (free) for legal invoicing
5. Purchase a domain (approximately twelve dollars)

CONVERSATION STYLE — CRITICAL:
You are JARVIS to Josh's Tony Stark. Talk like a real conversation between two people who work together closely — warm, natural, confident. Not a formal briefing. Not a robot status report.

- Greetings get greetings back. "Good morning" → respond with good morning + one useful thing
- Match Josh's energy. Casual message = casual reply. Urgent question = sharp answer.
- Maximum 2-3 sentences. Spoken aloud — no markdown, no bullet points, no asterisks
- Numbers spoken out: "fifteen hundred dollars" not "$1,500"
- When Josh asks you to do something: confirm it in one sentence, then stop
- Never start with "Certainly", "Of course", "Absolutely", "Sure" — just talk
- Sound like you actually know Josh and care about the mission, not like a help desk
- It's okay to be brief AND warm at the same time`;

// ── DOMAIN AGENT SYSTEM PROMPTS ──────────────────────────────────────────────
const DOMAIN_PROMPTS = {
  operations: `OPERATIONS AGENT ACTIVE. You handle: Make.com automations, Supabase database, Netlify deployments, GitHub, system health, technical buildouts. Focus on execution status, blockers, and what is deploying or running. Be specific about platform states.`,

  finance: `FINANCE AGENT ACTIVE. You handle: revenue tracking, costs, margins, cash flow, Israeli tax implications, Stripe revenue events, P&L. Current state: zero revenue, pre-Stripe. Remind Josh that Israeli income tax is progressive and he needs an Israeli accountant (רואה חשבון) after first revenue. 0% VAT on US/EU client exports is the margin advantage.`,

  growth: `GROWTH AGENT ACTIVE. You handle: client acquisition, outreach campaigns, lead pipeline, conversion optimization, distribution strategy. Focus on the fastest path to the first paying client. Recommended first action: identify 10 target SMBs and draft cold outreach via Gmail automation.`,

  content: `CONTENT AGENT ACTIVE. You handle: marketing copy, landing pages, agency positioning, email sequences, social posts, proposals, case studies. All content targets US/EU English-speaking SMB decision-makers. Tone: confident, specific, ROI-focused.`,

  sales: `SALES AGENT ACTIVE. You handle: client pipeline, proposal generation, pricing, objection handling, deal flow. Standard pricing: discovery call (free), automation audit ($500), monthly retainer ($1,500-$5,000 USD). Target first signed retainer within 14 days of first outreach.`,

  client_success: `CLIENT SUCCESS AGENT ACTIVE. You handle: client onboarding, delivery milestones, satisfaction tracking, renewal strategy, upsell opportunities. No clients yet — focus on designing the onboarding workflow so it is ready when first client signs.`,

  legal: `LEGAL AGENT ACTIVE. You handle: Israeli business compliance, contract templates, privacy policy, terms of service, GDPR for EU clients, Israel Privacy Protection Law (PPL). CRITICAL: SASHA flags legal questions but does not provide legal advice — always recommend Josh consult an Israeli attorney (עורך דין) for binding decisions. Current priority: עוסק מורשה registration is legally required before invoicing.`,

  strategic: `STRATEGIC ADVISOR ACTIVE. You handle: business direction, income stream ranking, market positioning, competitive analysis, 30/60/90 day planning. Top-ranked income stream remains AI Automation Agency. Recommend Josh focus all energy on landing first retainer client before diversifying.`,

  rnd: `R&D AGENT ACTIVE. You handle: market research, income model evaluation, competitive landscape, technology feasibility, new opportunity assessment. Reference the income_streams.md analysis: top 3 are AI Automation Agency, AI Content Operations, White-Label AI Chatbot. All validated against Israel stack.`,

  monitor: `MONITOR AGENT ACTIVE. You handle: platform health checks, agent performance, pipeline optimization, anomaly detection, system-wide status. Report on what is running, what is degraded, what needs attention. Escalate only real blockers.`,

  it: `IT AGENT ACTIVE. You handle: internal infrastructure diagnostics, deployment issues, Netlify build failures, GitHub branch state, Supabase connection health, Make.com scenario errors, API key validity, pipeline stage failures, and cross-system integration problems. Diagnose first, fix autonomously where possible, escalate only what requires Josh's credentials or account access. Always check: correct branch (claude/new-repository-bap65s), env vars set, all 13 agent files present, Supabase connection alive.`,

  general: `GENERAL ROUTING ACTIVE. Handle this query using the full SASHA operating context. Route to the most relevant domain knowledge available.`
};

// ── MANAGEMENT CLASSIFIER PROMPT ─────────────────────────────────────────────
const MANAGEMENT_CLASSIFIER = `You are SASHA's Management Agent — Chief of Staff. Your only job is to classify incoming messages and route them to the correct department.

Departments: operations, finance, growth, content, sales, client_success, legal, strategic, rnd, monitor, it, general

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
- Infrastructure/deployment/errors/broken/fix/debug/Netlify/GitHub/Supabase issues → it`;

// ── QA AGENT PROMPT ──────────────────────────────────────────────────────────
const QA_PROMPT = `You are SASHA's QA Agent. Review the draft response for these criteria:

1. CONVERSATIONAL: Does it sound like a real person talking? Natural, warm, direct — like JARVIS talking to Tony Stark
2. BREVITY: Max 3 sentences. Voice output — cut anything that doesn't need to be said
3. FORMAT: Zero markdown. No asterisks, no headers, no bullet points. Plain spoken English only.
4. ACCURACY: No invented facts about Josh's business. Stick to what is known.
5. VOICE-SAFE: Numbers spoken out ("fifteen hundred"), no special characters that sound weird spoken aloud
6. NO FILLER OPENERS: Remove "Certainly", "Of course", "Absolutely", "Great question", "Sure thing" — cut straight to the response

If the response passes all criteria, return it exactly as-is.
If it fails, fix only what is wrong — preserve warmth and natural tone.
Return ONLY the final response text. No QA notes, no commentary, no prefix.`;

// ── SECURITY SCANNER ─────────────────────────────────────────────────────────
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
      return {
        safe: false,
        sanitized: 'Response withheld by Security Agent. Potential sensitive data detected. Josh, check the system logs.'
      };
    }
  }

  if (text.length > 1200) {
    return {
      safe: true,
      sanitized: text.substring(0, 1200).trim() + '... Response truncated by QA Agent for voice output.'
    };
  }

  return { safe: true, sanitized: text };
}

// ── ANTHROPIC API CALL ───────────────────────────────────────────────────────
async function callClaude(apiKey, system, messages, maxTokens = 300) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system,
      messages
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'API error');
  return data.content[0].text;
}

// ── PIPELINE ─────────────────────────────────────────────────────────────────
async function runPipeline(apiKey, userMessage, conversationHistory) {
  const userMsg = [{ role: 'user', content: userMessage }];
  const fullHistory = [...conversationHistory, ...userMsg];

  // STEP 1: Management — classify and route
  let routing = { department: 'general', intent: 'general query', priority: 'normal' };
  try {
    const classifyResponse = await callClaude(
      apiKey,
      MANAGEMENT_CLASSIFIER,
      userMsg,
      60
    );
    const parsed = JSON.parse(classifyResponse.trim());
    if (parsed.department) routing = parsed;
  } catch {
    // Classification failed — fall through to general
  }

  // STEP 2: Domain Agent — generate response with specialized context
  const domainContext = DOMAIN_PROMPTS[routing.department] || DOMAIN_PROMPTS.general;
  const agentSystemPrompt = `${BASE_IDENTITY}\n\n${domainContext}`;

  const draftResponse = await callClaude(
    apiKey,
    agentSystemPrompt,
    fullHistory,
    300
  );

  // STEP 3: Security Scan — inline, no API call
  const secCheck = securityScan(draftResponse);
  if (!secCheck.safe) {
    return { response: secCheck.sanitized, meta: { ...routing, qa: 'security_block' } };
  }

  // STEP 4: QA Agent — validate and polish
  let finalResponse = secCheck.sanitized;
  try {
    const qaMessages = [
      {
        role: 'user',
        content: `User said: "${userMessage}"\n\nDraft response:\n${secCheck.sanitized}`
      }
    ];
    finalResponse = await callClaude(apiKey, QA_PROMPT, qaMessages, 300);
    finalResponse = securityScan(finalResponse).sanitized;
  } catch {
    // QA failed — use security-scanned draft
    finalResponse = secCheck.sanitized;
  }

  return {
    response: finalResponse,
    meta: { ...routing, pipeline: 'management→domain→security→qa' }
  };
}

// ── HANDLER ──────────────────────────────────────────────────────────────────
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
        response: 'API key not configured. Josh, add ANTHROPIC underscore API underscore KEY to Netlify environment variables. I am partially offline until then.',
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
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify(result)
    };
  } catch (err) {
    const isAuthError = err.message?.includes('auth') || err.message?.includes('key');
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        response: isAuthError
          ? 'Authentication error. Josh, the API key may be invalid or expired. Check Netlify environment variables.'
          : 'Pipeline error. Retrying on next message. All systems otherwise nominal.',
        meta: { error: err.message, pipeline: 'failed' }
      })
    };
  }
};
