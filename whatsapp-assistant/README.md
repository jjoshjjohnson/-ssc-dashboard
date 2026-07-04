# WhatsApp Assistant

A personal WhatsApp assistant: message it like a contact, it replies using Claude, and it can remember notes ("remember ...") across conversations. Fully separate from the SASHA site — own Netlify project, own functions, own dashboard.

## What's here

- `netlify/functions/wa-webhook.js` — receives WhatsApp messages (Meta Cloud API webhook), calls Claude, replies, logs everything.
- `netlify/functions/wa-dashboard-data.js` — token-gated API the dashboard polls for message/notes history.
- `public/index.html` — standalone dashboard: chat log + saved notes, refreshes every 8s.
- Supabase tables `wa_messages` and `wa_notes` (project `upnjyjxnzjuuoyrcgdat`, the same one used by the SSC app) — RLS is enabled with no policies, so only the service role key (used server-side) can read/write them.

A Netlify site was created for this (`jj-wa-assistant-9f21`, https://jj-wa-assistant-9f21.netlify.app). `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `WHATSAPP_VERIFY_TOKEN`, and `DASHBOARD_TOKEN` are already set on it. What's left needs your accounts/credentials — see below.

## What you still need to do (~15–20 min)

### 1. Link the Netlify site to this repo
Netlify dashboard → **jj-wa-assistant-9f21** → *Project configuration → Build & deploy → Continuous deployment* → link to `jjoshjjohnson/-ssc-dashboard`, branch `claude/whatsapp-bot-dashboard-w9l4p4` (or `master` after this merges), and set **Base directory** to `whatsapp-assistant`. It picks up `whatsapp-assistant/netlify.toml` from there automatically. This triggers the first deploy.

### 2. Meta WhatsApp Cloud API
1. Create a Meta developer app at developers.facebook.com → add the **WhatsApp** product.
2. Meta gives you a free test phone number (fine for personal use) or attach your own.
3. Under WhatsApp → API Setup, generate a **permanent access token** (System User token, not the 24h temporary one) → give it to me, or set it yourself as `WHATSAPP_TOKEN`.
4. Note the **Phone Number ID** shown on that same page → give it to me, or set it yourself as `WHATSAPP_PHONE_NUMBER_ID`.
5. Under App Settings → Basic, note the **App Secret** → give it to me, or set it yourself as `WHATSAPP_APP_SECRET`.
6. Under WhatsApp → Configuration, set the webhook:
   - Callback URL: `https://jj-wa-assistant-9f21.netlify.app/webhook`
   - Verify token: already set as `WHATSAPP_VERIFY_TOKEN` on the Netlify site — ask me for the value, or check the Netlify env vars UI, and paste that same value into Meta's config
   - Subscribe to the `messages` field.
7. Add your own phone number as an allowed tester number (required until the app goes through Meta's app review for production use).

### 3. Supabase service role key
Supabase dashboard → project `upnjyjxnzjuuoyrcgdat` ("Ssc loveable app") → Project Settings → API → `service_role` secret → give it to me, or set it yourself as `SUPABASE_SERVICE_ROLE_KEY` on the Netlify site. (Not the anon key — this one bypasses RLS, keep it server-side only.)

Once steps 1–3 are done (or you've handed me the 4 values), tell me and I'll set any remaining env vars and verify the whole flow.

### 4. Try it
Message your WhatsApp test number: "hey" should get a normal reply, "remember my flight is on the 10th" should get a confirmation and show up in the dashboard's Notes panel.

Visit `https://jj-wa-assistant-9f21.netlify.app`, enter the dashboard token (ask me, or check the Netlify env vars UI for `DASHBOARD_TOKEN`), and you'll see the live conversation + notes.

## Notes / limitations
- Meta's test numbers only message pre-approved tester numbers until the app passes review — fine for personal use, but review is needed if you ever want it to receive from arbitrary numbers.
- Conversation history sent to Claude is capped at the last 20 messages and 50 notes to keep token usage bounded.
- Unrelated to this build: Supabase flagged that `clients`, `leads`, `campaigns`, `campaign_contacts`, and `transactions` in the same project have RLS disabled (fully exposed to the anon key). Not touched here since it's out of scope, but worth fixing separately.
