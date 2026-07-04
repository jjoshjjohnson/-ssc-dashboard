# WhatsApp Assistant

A personal WhatsApp assistant: message it like a contact, it replies using Claude, and it can remember notes ("remember ...") across conversations. Fully separate from the SASHA site — own Netlify project, own functions, own dashboard.

## What's here

- `netlify/functions/wa-webhook.js` — receives WhatsApp messages (Meta Cloud API webhook), calls Claude, replies, logs everything.
- `netlify/functions/wa-dashboard-data.js` — token-gated API the dashboard polls for message/notes history.
- `public/index.html` — standalone dashboard: chat log + saved notes, refreshes every 8s.
- Supabase tables `wa_messages` and `wa_notes` (project `upnjyjxnzjuuoyrcgdat`, the same one used by the SSC app) — RLS is enabled with no policies, so only the service role key (used server-side) can read/write them.

A Netlify site was created for this (`jj-wa-assistant-9f21`, https://jj-wa-assistant-9f21.netlify.app) but it has no deploy yet — linking it to this repo and setting env vars are the two things only you can do (see below).

## One-time setup (~20–30 min)

### 1. Link the Netlify site to this repo
In the Netlify dashboard → **jj-wa-assistant-9f21** → *Project configuration → Build & deploy → Continuous deployment* → link to `jjoshjjohnson/-ssc-dashboard`, branch `claude/whatsapp-bot-dashboard-w9l4p4` (or `master` after this merges), and set **Base directory** to `whatsapp-assistant`. It'll pick up `whatsapp-assistant/netlify.toml` from there automatically.

### 2. Meta WhatsApp Cloud API
1. Create a Meta developer app at developers.facebook.com → add the **WhatsApp** product.
2. Meta gives you a free test phone number (fine for personal use) or attach your own.
3. Under WhatsApp → API Setup, generate a **permanent access token** (System User token, not the 24h temporary one).
4. Note the **Phone Number ID** shown on that same page.
5. Under App Settings → Basic, note the **App Secret**.
6. Under WhatsApp → Configuration, set the webhook:
   - Callback URL: `https://jj-wa-assistant-9f21.netlify.app/webhook`
   - Verify token: any random string you pick (put the same value in `WHATSAPP_VERIFY_TOKEN` below)
   - Subscribe to the `messages` field.
7. Add your own phone number as an allowed tester number (required until the app goes through Meta's app review for production use).

### 3. Environment variables
Set these on the **jj-wa-assistant-9f21** Netlify site (Project configuration → Environment variables):

| Variable | Value |
|---|---|
| `WHATSAPP_TOKEN` | permanent access token from step 2.3 |
| `WHATSAPP_PHONE_NUMBER_ID` | from step 2.4 |
| `WHATSAPP_APP_SECRET` | from step 2.5 (enables webhook signature verification) |
| `WHATSAPP_VERIFY_TOKEN` | the random string you picked in step 2.6 |
| `ANTHROPIC_API_KEY` | same key already used by the SASHA site |
| `SUPABASE_URL` | `https://upnjyjxnzjuuoyrcgdat.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase → Project Settings → API → `service_role` secret (**not** the anon key — this bypasses RLS, keep it server-side only) |
| `DASHBOARD_TOKEN` | any password you choose to gate the dashboard page |

Tell me the values and I can set most of these for you via the Netlify env var tool — except I won't ask you to paste secrets into chat if you'd rather set them directly in the Netlify UI.

### 4. Try it
Message your WhatsApp test number: "hey" should get a normal reply, "remember my flight is on the 10th" should get a confirmation and show up in the dashboard's Notes panel.

Visit `https://jj-wa-assistant-9f21.netlify.app`, enter the `DASHBOARD_TOKEN` you set, and you'll see the live conversation + notes.

## Notes / limitations
- Meta's test numbers only message pre-approved tester numbers until the app passes review — fine for personal use, but review is needed if you ever want it to receive from arbitrary numbers.
- Conversation history sent to Claude is capped at the last 20 messages and 50 notes to keep token usage bounded.
- Unrelated to this build: Supabase flagged that `clients`, `leads`, `campaigns`, `campaign_contacts`, and `transactions` in the same project have RLS disabled (fully exposed to the anon key). Not touched here since it's out of scope, but worth fixing separately.
