# SASHA CAPABILITIES REGISTER
Last Updated: 2026-06-29
Version: 0.3.0

---

## TIER 1 — FULLY AUTONOMOUS (No human required, credentials set)

### AI Pipeline
- Full 5-stage pipeline: Management → Agentic Loop → Security → QA → Self-Reflect
- Voice transcription via Groq Whisper (whisper-large-v3-turbo) — fast, accurate from Israel
- Voice output via Web Speech API (English neural voice, rate 0.88, pitch 0.95)
- Self-improvement loop: scores every interaction, writes to sasha/memory/reflections.jsonl
- Self-audit tool: reads last 15 reflections, produces score/strengths/gaps/recommendation

### Compute & Code
- Read/write/edit any file in working directory
- Execute bash commands (Linux, Node, Python available)
- Run git operations (commit, push, branch, PR)
- Deploy to Netlify (full pipeline)
- Manage Supabase (database, migrations, edge functions, branches)

### Memory (GitHub — GITHUB_TOKEN set)
- Read any file in sasha/ directory via memory_read tool
- Write/update any file in sasha/ directory via memory_write tool
- Self-reflection log: sasha/memory/reflections.jsonl (auto-updated after every conversation)

### Content & Design
- Generate designs via Canva (templates, brand kits, export)
- Write, structure, and publish documents
- Email drafting via Gmail MCP

### Research
- Web research via WebSearch and WebFetch (Claude Code tools, session-based)
- Zoom recordings and meeting data access

---

## TIER 2 — DEPLOYED BUT NEEDS ENV VARS (Tools built, credentials pending)

| Tool | Env Var Needed | Capability Unlocked |
|---|---|---|
| make_list_scenarios | MAKE_API_KEY + MAKE_TEAM_ID | See all Make.com scenarios |
| make_activate_scenario | MAKE_API_KEY | Turn on any scenario |
| make_run_scenario | MAKE_API_KEY | Manually trigger any scenario |
| make_trigger_webhook | None (uses webhook URL) | POST to any Make.com webhook |
| supabase_query | SUPABASE_URL + SUPABASE_SERVICE_KEY | Read any database table |
| supabase_insert | SUPABASE_URL + SUPABASE_SERVICE_KEY | Add clients, leads, campaigns |
| supabase_update | SUPABASE_URL + SUPABASE_SERVICE_KEY | Update any database record |
| web_search | SERPER_API_KEY | Real-time Google search |

---

## TIER 3 — REQUIRES JOSH ONE-TIME SETUP

| Capability Needed | Blocker | Action Required from Josh |
|---|---|---|
| Payment processing | No Stripe account | Create account, share API keys |
| Email sending (outbound) | Gmail send permission unconfirmed | Grant send scope or provide SMTP |
| Legal invoicing | No עוסק מורשה number | Register at misim.gov.il |
| Domain + hosting brand | No custom domain purchased | Buy domain (~$12), point to Netlify |
| GitHub repo expansion | OAuth scope | Add repositories via settings |

---

## ACTIVE INTEGRATIONS CONFIRMED

| Service | Status | Notes |
|---|---|---|
| Anthropic Claude | Active | claude-haiku-4-5-20251001 for pipeline |
| Groq Whisper | Active | whisper-large-v3-turbo, GROQ_API_KEY set |
| GitHub | Active | Scoped to -ssc-dashboard repo, GITHUB_TOKEN set |
| Supabase | Connected | Full access — needs SUPABASE_URL + SERVICE_KEY for tools |
| Make.com | Connected | Full platform — needs MAKE_API_KEY for tools |
| Netlify | Active | Deploy + project management |
| Gmail | Active | Read + draft (send TBD) |
| Google Drive | Active | Read/write |
| Canva | Active | Design generation |
| Zoom | Active | Recordings + meetings |
| Serper.dev | Pending | Needs SERPER_API_KEY (free tier) |
| Stripe | Not connected | Josh action required |
| Zoho Invoice | Not set up | Josh action required |

---

## CAPABILITY GAPS (known)

- No outbound payment capability (Stripe not connected)
- No customer-facing landing page beyond sscsd.netlify.app
- No CRM tables yet (Supabase schema build is next session task)
- Gmail send permission unconfirmed (Make.com Gmail module is fallback)
- No social media posting MCP — content drafted, posted manually by Josh
- Video production: Canva only (no Descript/Premiere/HeyGen MCP)
