# Composio — connect 26 tools for ORCA (step-by-step)

ORCA uses **Composio** for OAuth integrations. You need:

1. One **Composio API key** in Vercel (and local `.env.local`)
2. One **Auth Config** per toolkit in Composio (26 below)
3. Connect each tool in **Dashboard → Integrations**

---

## Step 0 — Composio API key (5 min)

1. Go to https://app.composio.dev
2. **Settings → API Keys** → Create key
3. **Vercel** → Environment Variables:

```env
COMPOSIO_API_KEY=ak_xxxxxxxxxxxxxxxx
```

4. **Redeploy** Vercel (required).

---

## Step 1 — Create Auth Configs in Composio

For each row: **Auth configs → Create →** pick toolkit → **Composio OAuth** (easiest) → Save → copy **Auth Config ID**.

| # | Connect in ORCA | Composio toolkit slug |
|---|-----------------|------------------------|
| 1 | Gmail Outreach | `gmail` |
| 2 | HubSpot | `hubspot` |
| 3 | LinkedIn | `linkedin` |
| 4 | Google Drive | `googledrive` |
| 5 | Notion | `notion` |
| 6 | X / Twitter | `twitter` |
| 7 | Slack | `slack` |
| 8 | GitHub | `github` |
| 9 | Google Calendar | `googlecalendar` |
| 10 | Meta (Facebook) | `facebook` |
| 11 | Mailchimp | `mailchimp` |
| 12 | Intercom | `intercom` |
| 13 | Linear | `linear` |
| 14 | Instagram | `instagram` |
| 15 | Google Sheets | `googlesheets` |
| 16 | Supabase | `supabase` |
| 17 | Outlook | `outlook` |
| 18 | Perplexity AI | `perplexityai` |
| 19 | Google Docs | `googledocs` |
| 20 | Airtable | `airtable` |
| 21 | SerpAPI | `serpapi` |
| 22 | Jira | `jira` |
| 23 | Firecrawl | `firecrawl` |
| 24 | Tavily | `tavily` |
| 25 | YouTube | `youtube` |
| 26 | Slackbot | `slackbot` |

**Note:** Gmail Outreach uses the `gmail` toolkit — one Gmail Auth Config covers it.

---

## Step 2 — Optional Vercel overrides (if auto-lookup fails)

If ORCA shows *"no composio auth config"*, paste the Auth Config ID:

```env
COMPOSIO_AUTH_CONFIG_GMAIL_OUTREACH=ac_xxxx
COMPOSIO_AUTH_CONFIG_HUBSPOT=ac_xxxx
COMPOSIO_AUTH_CONFIG_LINKEDIN=ac_xxxx
COMPOSIO_AUTH_CONFIG_GOOGLE_DRIVE=ac_xxxx
COMPOSIO_AUTH_CONFIG_NOTION=ac_xxxx
COMPOSIO_AUTH_CONFIG_TWITTER=ac_xxxx
COMPOSIO_AUTH_CONFIG_SLACK=ac_xxxx
COMPOSIO_AUTH_CONFIG_GITHUB=ac_xxxx
COMPOSIO_AUTH_CONFIG_GOOGLE_CALENDAR=ac_xxxx
COMPOSIO_AUTH_CONFIG_META=ac_xxxx
COMPOSIO_AUTH_CONFIG_MAILCHIMP=ac_xxxx
COMPOSIO_AUTH_CONFIG_INTERCOM=ac_xxxx
COMPOSIO_AUTH_CONFIG_LINEAR=ac_xxxx
COMPOSIO_AUTH_CONFIG_INSTAGRAM=ac_xxxx
COMPOSIO_AUTH_CONFIG_GOOGLESHEETS=ac_xxxx
COMPOSIO_AUTH_CONFIG_SUPABASE=ac_xxxx
COMPOSIO_AUTH_CONFIG_OUTLOOK=ac_xxxx
COMPOSIO_AUTH_CONFIG_PERPLEXITYAI=ac_xxxx
COMPOSIO_AUTH_CONFIG_GOOGLEDOCS=ac_xxxx
COMPOSIO_AUTH_CONFIG_AIRTABLE=ac_xxxx
COMPOSIO_AUTH_CONFIG_SERPAPI=ac_xxxx
COMPOSIO_AUTH_CONFIG_JIRA=ac_xxxx
COMPOSIO_AUTH_CONFIG_FIRECRAWL=ac_xxxx
COMPOSIO_AUTH_CONFIG_TAVILY=ac_xxxx
COMPOSIO_AUTH_CONFIG_YOUTUBE=ac_xxxx
COMPOSIO_AUTH_CONFIG_SLACKBOT=ac_xxxx
```

Redeploy after adding.

---

## Step 3 — Connect inside ORCA (15–30 min)

1. Log in to https://orca-sigma.vercel.app
2. **Dashboard → Integrations**
3. Connect in priority order:
   - Gmail Outreach, HubSpot, LinkedIn, Google Drive, Notion
   - Then Slack, GitHub, Calendar, Twitter
   - Then the rest as you need them

Each click → Composio OAuth → Allow → return to ORCA with green success.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `composio_missing_api_key` | Add `COMPOSIO_API_KEY` to Vercel, redeploy |
| `no_composio_auth_config` | Create Auth Config for that toolkit in Composio OR set `COMPOSIO_AUTH_CONFIG_*` |
| `composio_api_error` | Wrong API key or toolkit slug — check Composio dashboard |
| `composio_link_failed` | Callback URL must be `https://orca-sigma.vercel.app/api/integrations/oauth/{service}/callback` |

---

## Minimum for launch sprint (5 tools)

If short on time, only do: **Gmail, HubSpot, LinkedIn, Google Drive, Notion**.
