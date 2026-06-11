# ORCA — Complete Environment Variables
## Where each key goes: Frontend (NEXT_PUBLIC_*) vs Backend (server-side only)

---

> **Rule of thumb:**
> - Variables starting with `NEXT_PUBLIC_` → safe for frontend, exposed to browser
> - Everything else → backend only, never exposed to browser
> - If a key gives access to money, data, or external services → backend only

---

```env
# ============================================================
# SUPABASE — Database, Auth, Realtime, Storage
# ============================================================

# FRONTEND + BACKEND — safe to expose to browser
# Used by: client-side auth, React hooks, Supabase Realtime subscriptions
# Found at: supabase.com → your project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# FRONTEND + BACKEND — safe to expose to browser
# Used by: client-side queries with RLS, Supabase auth on frontend
# Found at: supabase.com → your project → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# BACKEND ONLY — NEVER expose to browser, NEVER use as NEXT_PUBLIC_
# Bypasses RLS — full database access with no restrictions
# Used by: seedNewOrg(), Inngest functions, admin API routes
# Found at: supabase.com → your project → Settings → API
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================
# AI — PRIMARY MODELS
# ============================================================

# BACKEND ONLY — never expose to browser
# Used by: all 45 agents via LangChain in /api/conversations/[id]/messages
# Powers: complex tasks, long-context analysis, main agent responses
# Get it: console.cloud.google.com → Generative Language API → Credentials
GEMINI_API_KEY=AIza...

# BACKEND ONLY — never expose to browser
# Used by: all 45 agents for fast, low-latency responses
# Powers: short briefs, quick tasks, real-time agent replies
# Get it: console.groq.com → API Keys
GROQ_API_KEY=gsk_...

# ============================================================
# PAYMENTS — Paystack
# ============================================================

# BACKEND ONLY — never expose to browser
# Used by: /api/billing/checkout, /api/billing/webhook, /api/billing/cancel
# Powers: creating checkout sessions, verifying payments, cancelling subscriptions
# Get it: dashboard.paystack.com → Settings → API Keys & Webhooks
PAYSTACK_SECRET_KEY=sk_test_...

# FRONTEND + BACKEND — safe to expose to browser
# Used by: frontend Paystack.js to initialize the payment popup
# Get it: dashboard.paystack.com → Settings → API Keys & Webhooks
PAYSTACK_PUBLIC_KEY=pk_test_...

# BACKEND ONLY — used in /api/billing/checkout to select the correct plan
# Created in: dashboard.paystack.com → Products → Subscriptions → Plans
PAYSTACK_PLAN_STARTER_MONTHLY=PLN_...
PAYSTACK_PLAN_STARTER_ANNUAL=PLN_...
PAYSTACK_PLAN_PRO_MONTHLY=PLN_...
PAYSTACK_PLAN_PRO_ANNUAL=PLN_...
PAYSTACK_PLAN_ENTERPRISE_MONTHLY=PLN_...
PAYSTACK_PLAN_ENTERPRISE_ANNUAL=PLN_...

# ============================================================
# EMAIL — Gmail SMTP (Verification emails)
# ============================================================

# BACKEND ONLY — never expose to browser
# Used by: lib/email/gmail.ts → Nodemailer transport
# Powers: account verification emails, password reset emails
# Also configured in Supabase → Auth → Settings → Custom SMTP
GMAIL_USER=your-gmail@gmail.com

# BACKEND ONLY — never expose to browser
# NOT your Gmail login password — a 16-char App Password
# Generate at: myaccount.google.com → Security → App Passwords
# Powers: Nodemailer authenticating with Gmail SMTP server
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# ============================================================
# EMAIL — Resend (Transactional emails)
# ============================================================

# BACKEND ONLY — never expose to browser
# Used by: lib/email/resend.ts
# Powers: invite emails, welcome emails, approval notifications,
#         plan upgrade confirmations
# Waiting on domain verification before this works
# Get it: resend.com → API Keys
RESEND_API_KEY=re_...

# ============================================================
# BACKGROUND JOBS — Inngest
# ============================================================

# BACKEND ONLY — never expose to browser, never use as NEXT_PUBLIC_
# Used by: lib/inngest/client.ts → inngest.send() to fire events
# Powers: triggering coordination jobs, background processing
# Get it: inngest.com → Manage → Event Keys
INNGEST_EVENT_KEY=...

# BACKEND ONLY — never expose to browser
# Used by: Inngest to verify requests to /api/inngest are genuine
# Powers: secure communication between Inngest cloud and your app
# Get it: inngest.com → Manage → Signing Keys
INNGEST_SIGNING_KEY=signkey-prod-...

# LOCAL DEV ONLY — remove from Vercel production
# Disables signature verification during local development
INNGEST_DEV=1

# ============================================================
# AGENT ACTIONS — Composio
# ============================================================

# BACKEND ONLY — never expose to browser
# Used by: lib/agents/composioExecutor.ts
# Powers: agents executing real actions on connected services
#         e.g. Aria publishing to LinkedIn, Ghost opening a GitHub PR
# Get it: composio.dev → Settings → API Keys
COMPOSIO_API_KEY=...

# ============================================================
# SECURITY — Token Encryption
# ============================================================

# BACKEND ONLY — never expose to browser
# Used by: lib/security/encrypt.ts → encryptToken() and decryptToken()
# Powers: encrypting ALL OAuth tokens and API keys before storing in DB
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# CRITICAL: Never change this after users connect integrations
# CRITICAL: Store a backup — if lost, all stored tokens become unreadable
ENCRYPTION_KEY=your-64-character-hex-string-here

# ============================================================
# APP URL
# ============================================================

# FRONTEND + BACKEND — safe to expose to browser
# Used by: OAuth redirect URIs, email links, frontend routing
# Change to custom domain once you have one
NEXT_PUBLIC_APP_URL=https://orca-sigma.vercel.app

# ============================================================
# OAUTH — GitHub (Tech & Security dept)
# ============================================================

# BACKEND ONLY — never expose to browser
# Used by: /api/integrations/oauth/github/initiate and /callback
# Powers: Ghost (security scanning), Cipher (PR reviews),
#         Wren (deployments), Hex (docs), Volt (incidents)
# Callback: https://orca-sigma.vercel.app/api/integrations/oauth/github/callback
# Create at: github.com → Settings → Developer Settings → OAuth Apps
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# ============================================================
# OAUTH — Google (Marketing + Ops + Sales)
# ============================================================

# BACKEND ONLY — never expose to browser
# Single app covers all Google services
# Powers: Lucy (Analytics), Cal (Calendar),
#         Mark + Chase (Gmail outreach), Dean (Drive + Docs)
# Callbacks registered:
#   https://orca-sigma.vercel.app/api/integrations/oauth/google_analytics/callback
#   https://orca-sigma.vercel.app/api/integrations/oauth/google_calendar/callback
#   https://orca-sigma.vercel.app/api/integrations/oauth/gmail_outreach/callback
# Create at: console.cloud.google.com → Credentials → OAuth 2.0 Client IDs
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ============================================================
# OAUTH — LinkedIn (Marketing + Hiring)
# ============================================================

# BACKEND ONLY — never expose to browser
# Powers: Aria (publishing posts), Mark (sales outreach),
#         Marcus (talent sourcing for hiring)
# Callbacks:
#   https://orca-sigma.vercel.app/api/integrations/oauth/linkedin/callback
#   https://orca-sigma.vercel.app/api/integrations/oauth/linkedin_hiring/callback
# Create at: linkedin.com/developers → My Apps
# Requires ORCA LinkedIn Company Page to be associated
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# ============================================================
# OAUTH — Twitter/X (Marketing + Intelligence)
# ============================================================

# BACKEND ONLY — never expose to browser
# Powers: Aria (posting tweets, scheduling content),
#         Sage (monitoring brand mentions)
# App permissions: Read and Write and Direct Message
# Callback: https://orca-sigma.vercel.app/api/integrations/oauth/twitter/callback
# Create at: developer.twitter.com → Projects & Apps
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

# ============================================================
# OAUTH — Slack (Operations + CS + Community)
# ============================================================

# BACKEND ONLY — never expose to browser
# Powers: Iris (inbox triage), Owen (task coordination),
#         Milo (community), Purity + Beatrice (CS alerts)
# Scopes: chat:write, channels:read, im:write, users:read
# Callback: https://orca-sigma.vercel.app/api/integrations/oauth/slack/callback
# Create at: api.slack.com/apps
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=

# ============================================================
# OAUTH — Notion (Operations + Hiring + CS)
# ============================================================

# BACKEND ONLY — never expose to browser
# Powers: Dean (docs, notes, SOPs), Nina (onboarding wikis),
#         Eli (offer coordination docs)
# Callback: https://orca-sigma.vercel.app/api/integrations/oauth/notion/callback
# Create at: notion.so/my-integrations → New Integration → Public type
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=

# ============================================================
# OAUTH — HubSpot (Sales)
# ============================================================

# BACKEND ONLY — never expose to browser
# Powers: Clara (CRM contacts and deals pipeline),
#         Rex (pipeline management and deal tracking)
# Scopes: crm.objects.contacts.read/write, crm.objects.deals.read/write
# Callback: https://orca-sigma.vercel.app/api/integrations/oauth/hubspot/callback
# Create at: developers.hubspot.com → Legacy Apps → Create App
HUBSPOT_CLIENT_ID=
HUBSPOT_CLIENT_SECRET=

# ============================================================
# OAUTH — Meta Facebook + Instagram (Marketing)
# ============================================================

# BACKEND ONLY — never expose to browser
# Facebook App — powers Aria (Facebook Pages posting)
# Found at: developers.facebook.com → App Settings → Basic → App ID
META_APP_ID=
META_APP_SECRET=

# BACKEND ONLY — never expose to browser
# Instagram App — powers Aria (Instagram Business content publishing)
# NOTE: Separate App ID from Facebook — found on Instagram Platform setup page
# Found at: developers.facebook.com → your app → Instagram Platform → app ID
META_INSTAGRAM_APP_ID=
META_INSTAGRAM_APP_SECRET=

# Verify token for Instagram webhooks — you generate this yourself
# Generate: node -e "console.log(require('crypto').randomBytes(20).toString('hex'))"
# Only needed after Meta approves app for publishing
# Used by: /api/webhooks/instagram to verify Meta webhook calls
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=

# ============================================================
# OPTIONAL OAUTH — Add when users request these
# ============================================================

# Mailchimp — BACKEND ONLY
# Powers: Jackie (email campaigns), Bruce (onboarding sequences)
MAILCHIMP_CLIENT_ID=
MAILCHIMP_CLIENT_SECRET=

# Intercom — BACKEND ONLY
# Powers: Purity (live chat and support tickets)
INTERCOM_CLIENT_ID=
INTERCOM_CLIENT_SECRET=

# Zendesk — BACKEND ONLY
# Powers: Purity (ticket management)
ZENDESK_CLIENT_ID=
ZENDESK_CLIENT_SECRET=
ZENDESK_SUBDOMAIN=

# Typeform — BACKEND ONLY
# Powers: John (NPS surveys), Milo (community feedback)
TYPEFORM_CLIENT_ID=
TYPEFORM_CLIENT_SECRET=

# QuickBooks — BACKEND ONLY
# Powers: Felix (expense reconciliation), Cora (financial audit)
QUICKBOOKS_CLIENT_ID=
QUICKBOOKS_CLIENT_SECRET=

# DocuSign — BACKEND ONLY
# Powers: Lena (contract sending and e-signature)
DOCUSIGN_CLIENT_ID=
DOCUSIGN_CLIENT_SECRET=

# Discord — BACKEND ONLY
# Powers: Milo (community server management)
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# ============================================================
# WEBHOOK SECRETS
# ============================================================

# BACKEND ONLY
# Verifies HubSpot privacy deletion webhook calls are genuine
HUBSPOT_WEBHOOK_SECRET=

# ============================================================
# NOT ENV VARS — stored encrypted in database per org
# ============================================================
# These are NOT in .env.local or Vercel
# Users paste them in the dashboard and ORCA encrypts + stores them
#
# API KEY integrations (per-user, stored in integrations table):
#   Ahrefs       → Lucy (SEO research)
#   Semrush      → Lucy + Roman (SEO + competitive intel)
#   Apollo.io    → Rex (lead prospecting)
#   Hunter.io    → Rex + Mark (email finding)
#   Instantly    → Mark (cold email campaigns)
#   Vercel       → Wren (deployment management)
#   Sentry       → Volt (error monitoring)
#   Perplexity   → Roman (deep research)
#   Stripe key   → Bill + Felix (revenue data)
#   Workable     → Marcus + Vera (ATS)
#   Datadog      → Volt (uptime monitoring)
#
# BYOLLM keys (per-user, stored in llm_configs table):
#   OpenAI       → any agent (Pro+)
#   Anthropic    → any agent (Pro+)
#   Mistral      → any agent (Pro+)
#   Ollama URL   → any agent (Enterprise)

# ============================================================
# QUICK REFERENCE — FRONTEND vs BACKEND
# ============================================================
#
# FRONTEND (safe for browser, can use NEXT_PUBLIC_):
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   NEXT_PUBLIC_APP_URL
#   PAYSTACK_PUBLIC_KEY
#
# BACKEND ONLY (server-side, API routes, Inngest only):
#   SUPABASE_SERVICE_ROLE_KEY
#   GEMINI_API_KEY
#   GROQ_API_KEY
#   PAYSTACK_SECRET_KEY + all PAYSTACK_PLAN_ codes
#   GMAIL_USER + GMAIL_APP_PASSWORD
#   RESEND_API_KEY
#   INNGEST_EVENT_KEY + INNGEST_SIGNING_KEY
#   COMPOSIO_API_KEY
#   ENCRYPTION_KEY
#   All OAuth CLIENT_ID and CLIENT_SECRET pairs
#   META_APP_ID + META_APP_SECRET
#   META_INSTAGRAM_APP_ID + META_INSTAGRAM_APP_SECRET
#   INSTAGRAM_WEBHOOK_VERIFY_TOKEN
#   HUBSPOT_WEBHOOK_SECRET
#
# ============================================================
# STATUS
# ============================================================
#
# REQUIRED BEFORE FIRST USER SIGNS UP:
#   ✅ NEXT_PUBLIC_SUPABASE_URL
#   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
#   ✅ SUPABASE_SERVICE_ROLE_KEY
#   ✅ GEMINI_API_KEY
#   ✅ GROQ_API_KEY
#   ✅ GMAIL_USER + GMAIL_APP_PASSWORD
#   ✅ ENCRYPTION_KEY
#   ✅ NEXT_PUBLIC_APP_URL
#   ✅ INNGEST_EVENT_KEY + INNGEST_SIGNING_KEY
#   ✅ COMPOSIO_API_KEY
#
# REQUIRED BEFORE CHARGING USERS:
#   ✅ PAYSTACK_SECRET_KEY + PAYSTACK_PUBLIC_KEY
#   ✅ All 6 PAYSTACK_PLAN_ codes
#
# ONLY NEEDED WHEN USER CONNECTS THAT SERVICE:
#   ✅ GITHUB_CLIENT_ID + SECRET
#   ✅ GOOGLE_CLIENT_ID + SECRET
#   ✅ LINKEDIN_CLIENT_ID + SECRET
#   ✅ TWITTER_CLIENT_ID + SECRET
#   ✅ SLACK_CLIENT_ID + SECRET
#   ✅ NOTION_CLIENT_ID + SECRET
#   ✅ HUBSPOT_CLIENT_ID + SECRET
#   ✅ META_APP_ID + SECRET
#   ✅ META_INSTAGRAM_APP_ID + SECRET
#
# WAITING ON DOMAIN:
#   ⏳ RESEND_API_KEY
# ============================================================