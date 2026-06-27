# SKILL: Lead Capture Pipeline
Version: 1.0
Created: 2026-06-25

---

## PURPOSE
Build an end-to-end lead capture and nurture pipeline: landing page form → database → email confirmation → CRM entry → follow-up sequence.

## TRIGGER
- New product/service needs a waitlist or lead funnel
- Outreach campaign needs lead tracking
- Free tool or lead magnet being launched

## DEPENDENCIES
- Supabase (leads table)
- Make.com (webhook + email automation)
- Netlify (landing page hosting)
- Gmail (email delivery)
- Canva (optional: landing page graphics)

## EXECUTION STEPS

### 1. Create leads table in Supabase
Use supabase-data-layer skill — deploy standard leads table schema.

### 2. Create Make.com webhook scenario
Scenario: Webhook → Validate email → Supabase insert → Gmail send confirmation

```
Trigger: Custom Webhook (POST /leads)
Module 2: Tools > Set Variable (validate email format)
Module 3: Supabase > Insert Row (leads table)
Module 4: Gmail > Send Email (confirmation template)
Module 5: (optional) Slack/notification
```

### 3. Get webhook URL from Make.com
```
mcp__debeaf7b__hooks_get — retrieve webhook URL
```

### 4. Build landing page
Create simple HTML form that POSTs to Make webhook URL:
```html
<form action="[MAKE_WEBHOOK_URL]" method="POST">
  <input name="email" type="email" required>
  <input name="name" type="text">
  <button type="submit">Join Waitlist</button>
</form>
```

### 5. Deploy to Netlify
Use netlify-deploy skill.

### 6. Test full flow
- Submit form on deployed page
- Verify Make.com execution completed
- Check Supabase leads table for new row
- Verify confirmation email received

## EMAIL TEMPLATES

### Confirmation email
```
Subject: You're on the list
Body:
Hi [name],

You're confirmed. We'll reach out when [product] is ready.

— Josh
```

## OUTPUT FORMAT
- Webhook URL (save to decisions.md)
- Landing page URL
- Supabase table confirmed
- Test submission result

## METRICS TO TRACK
- Leads captured (Supabase count)
- Email open rate (Gmail/Make analytics)
- Source (add ?ref= param to track channels)

## NOTES
This pipeline costs $0 to operate using current stack. First lead can come in within 24 hours of build.
