# SASHA CAPABILITIES REGISTER
Last Updated: 2026-06-25
Version: 0.1.0

---

## TIER 1 — FULLY AUTONOMOUS (No human required)

### Compute & Code
- Read/write/edit any file in working directory
- Execute bash commands (Linux, Node, Python available)
- Run git operations (commit, push, branch, PR via GitHub MCP)
- Deploy to Netlify (full pipeline)
- Manage Supabase (database, migrations, edge functions, branches)
- Schedule recurring tasks via CronCreate

### Automation
- Make.com full platform access:
  - Create/activate/deactivate/run scenarios
  - Manage webhooks, data stores, data structures
  - Connect to 1000+ apps via Make connectors
  - Execute custom logic via Make tools
  - Manage connections and credentials (via credential request flows)

### Content & Design
- Generate designs via Canva (templates, brand kits, export)
- Research via WebSearch and WebFetch
- Write, structure, and publish documents

### Communication & Data
- Gmail: search threads, draft emails, manage labels
- Google Drive: create/read/search/copy files
- Zoom: access recordings and meeting data

### Intelligence
- Spawn sub-agents for parallel workstreams
- Web research (real-time)
- Code generation and deployment
- Data analysis via SQL (Supabase)

---

## TIER 2 — REQUIRES JOSH ONE-TIME SETUP

| Capability Needed | Blocker | Action Required from Josh |
|---|---|---|
| Payment processing | Stripe/PayPal account | Create account, share API keys |
| Domain + hosting brand | Custom domain | Purchase domain, point to Netlify |
| GitHub repo expansion | OAuth scope | Add repositories via settings |
| Email sending (outbound) | Gmail send permission | Grant send scope or provide SMTP |
| Legal entity | Business registration | Josh decision: LLC or sole proprietor |
| Ad spend | Payment method | Approve budget + card on file |
| OpenAI / Anthropic API | API keys | Share keys for AI-powered products |

---

## TIER 3 — CAPABILITY GAPS (SASHA must build)

- No outbound payment capability yet (need Stripe webhook + Make scenario)
- No customer-facing UI beyond what Netlify can deploy
- No CRM — can be built on Supabase
- No email marketing automation — buildable via Make + Gmail/SMTP
- No analytics dashboard — buildable on Supabase + Netlify
- No inbound webhook handler — buildable via Make scenarios

---

## ACTIVE INTEGRATIONS CONFIRMED

| Service | Status | Notes |
|---|---|---|
| GitHub | Active | Scoped to -ssc-dashboard repo |
| Supabase | Active | Full project access |
| Make.com | Active | Full platform access |
| Netlify | Active | Deploy + project management |
| Gmail | Active | Read + draft (send TBD) |
| Google Drive | Active | Read/write |
| Canva | Active | Design generation |
| Zoom | Active | Recordings + meetings |
