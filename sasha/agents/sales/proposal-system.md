# Proposal System — Design & Workflow
Version: 0.1.0
Owner: Sales Agent + Media Agent
Last Updated: 2026-06-27

---

## STATUS: DESIGNED — NOT YET BUILT

The proposal system is fully designed. The Canva template and Make.com automation need to be built.

---

## PROPOSAL TIERS

### Tier 1: Automation Audit ($500 one-time)
- Delivered as: Loom video walkthrough + Canva PDF report
- Content: 5 processes audited, 3 automation opportunities identified, ROI estimate
- Turnaround: 48 hours
- Purpose: Discovery → paid engagement → upsell to retainer

### Tier 2: Starter Retainer ($1,500/mo)
- 2 Make.com automations built and maintained
- Monthly optimization report
- Slack/email support (2 business days response)
- 3-month minimum

### Tier 3: Growth Retainer ($3,000/mo)
- 5+ automations, dedicated Supabase database
- Weekly check-in call (Zoom)
- Priority support (same-day response)
- Monthly P&L impact report

### Tier 4: Full Stack ($5,000/mo)
- Unlimited automations
- SASHA-operated marketing campaigns
- Weekly strategy call
- Daily AI assistant access
- 6-month minimum

---

## PROPOSAL GENERATION WORKFLOW

```
TRIGGER: Sales Agent — lead reaches "proposal ready" stage in Supabase

STEP 1: Pull lead context
  → Supabase: SELECT * FROM leads WHERE id = [lead_id]
  → Fields needed: company, name, pain_points, budget_range, tier_interest

STEP 2: Generate proposal copy
  → Claude API (via Sales Agent system prompt)
  → Generate: executive summary, scope, ROI projection, custom CTA

STEP 3: Design proposal PDF
  → Canva MCP: create-design-from-brand-template (proposal template)
  → Canva MCP: perform-editing-operations → fill in client name, company, scope
  → Canva MCP: export-design → PDF

STEP 4: Store and send
  → Google Drive MCP: upload to /proposals/[company-name]/[date]-proposal.pdf
  → Gmail MCP: send proposal email from template
  → Supabase: UPDATE leads SET proposal_sent_at = NOW(), stage = 'proposal_sent'

STEP 5: Follow-up sequence
  → Make.com: trigger follow-up if no reply in 48h
  → Day 2: check-in email ("Did you have a chance to review?")
  → Day 5: final follow-up with limited availability angle
  → Day 8: close or move to future pipeline
```

---

## BUILD CHECKLIST

- [ ] Supabase `leads` table with proposal tracking fields
- [ ] Canva proposal template (10 pages) — Media Agent owns
- [ ] Canva brand kit set up first
- [ ] Gmail proposal email template
- [ ] Make.com scenario: proposal send + follow-up automation
- [ ] Sales Agent can trigger the full flow via voice ("Send proposal to [company]")

---

## PROPOSAL EMAIL TEMPLATE

**Subject:** Automation Proposal for [Company] — [Specific Pain Point]

**Body:**
Hi [Name],

It was great connecting. Based on our conversation, I've put together a proposal specifically for [Company]'s [pain point].

The short version: I can automate [specific process], saving your team approximately [X hours/week] — that's [Y hours/month] back in your operations.

Full proposal here: [Google Drive link]

The investment for the [tier] engagement is [price]. I've kept it simple — one page on scope, one page on pricing.

Happy to walk through it on a 15-minute call this week. My calendar: [Calendly link — when set up]

Best,
Josh

---

## TRACKING METRICS

| Metric | Target | Track In |
|---|---|---|
| Proposals sent per week | 3–5 | Supabase |
| Proposal open rate | 80%+ | Gmail tracking pixel |
| Response rate | 60%+ | Supabase |
| Close rate | 20%+ | Supabase |
| Avg time to close | < 7 days | Supabase |
| Avg deal value | $1,500–$3,000 | Supabase/Finance Agent |

---

*Proposal System v0.1.0 | A proposal is a closing document, not a brochure. Every section earns the next.*
