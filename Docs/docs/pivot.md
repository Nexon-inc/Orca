# ORCA — Strategic Pivot
## pivot.md · Complete instructions for Antigravity
### Read this entire file before making any changes. This replaces previous specs where there is conflict.

---

## WHAT IS CHANGING AND WHY

ORCA is pivoting from a 9-department enterprise OS to a 5-department
solo founder tool. The core technology stays the same. The scope,
pricing, and positioning are being tightened to match the real ICP.

**The real user:** A solo founder or indie hacker who wakes up every day
doing the work of 6 different jobs simultaneously. They need a focused
set of AI departments that solve their daily pain — not an enterprise
OS with 9 departments they don't need yet.

**What changes:** Departments (9 → 5), agents (45 → 25), pricing
($99/$199/$399 → $0/$29/$59), ICP language, onboarding flow.

**What stays:** The agent architecture, coordination system, OrcaHub,
BYOLLM, the dashboard design, all existing integrations.

---

## CHANGE 1 — DEPARTMENTS (9 → 5)

### Keep these 5 departments only

| Dept | Key | Agents (5 each = 25 total) |
|------|-----|--------------------------|
| 📣 Marketing | `marketing` | Aria, Jackie, Eric, Lucy, Joe |
| 💼 Sales & Revenue | `sales` | Rex, Clara, Chase, Mark, Teo |
| 🤝 Customer Success | `cs` | Purity, Bruce, Nadia, John, Beatrice |
| 🔍 Intelligence & Research | `intel` | Roman, Sage, Nate, Ada, Dex |
| 🛡️ Tech & Vibe Coding | `tech` | Ghost, Cipher, Wren, Hex, Volt |

### Remove from active launch (keep in DB but mark inactive/coming soon)

These 4 departments are NOT removed from the codebase — they are
marked as `coming_soon: true` and shown as locked on the dashboard
with a "Coming soon — post-launch" badge:

- 🧠 People & Hiring
- 📋 Operations
- 📊 Finance & Legal
- 🌐 Community & Growth

**In the departmentbar:** Show only the 5 active departments. The 4 coming
soon departments appear greyed out whne clicked and with a lock icon
and "Coming soon" label. Do not remove them from the DB.

---

## CHANGE 2 — AGENT COUNT (45 → 25)

Only seed agents for the 5 active departments.
5 agents × 5 departments = 25 agents total.

Update `lib/seed/agentData.ts` — keep all 45 agent definitions but
only seed the 25 agents for the 5 active departments on signup.

Update `lib/seed/seedOrg.ts`:
```typescript
// Only seed active departments
const ACTIVE_DEPT_KEYS = ['marketing', 'sales', 'cs', 'intel', 'tech']

export async function seedNewOrg(orgId: string) {
  // Filter to active departments only
  const activeDepts = DEPARTMENT_SEED_DATA.filter(d =>
    ACTIVE_DEPT_KEYS.includes(d.key)
  )
  const activeAgents = AGENT_SEED_DATA.filter(a =>
    ACTIVE_DEPT_KEYS.includes(a.dept)
  )
  // ... rest of seed logic unchanged
}
```

---

## CHANGE 3 — TECH DEPARTMENT: VIBE CODING TWO-MODE TOGGLE

The Tech department gets a special setup that no other department has.
On first opening the Tech department, show a mode selection screen:

```
┌─────────────────────────────────────────────────────────────┐
│  🛡️ TECH & VIBE CODING                                      │
│                                                             │
│  How do you want to work with your tech team?              │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐         │
│  │  🔨 BUILD IT FOR ME │  │  🤝 BUILD WITH ME   │         │
│  │                     │  │                     │         │
│  │  Describe what you  │  │  You write code.    │         │
│  │  want in plain      │  │  Agents debug,      │         │
│  │  English. Agents    │  │  review, suggest,   │         │
│  │  build and deploy   │  │  and keep your      │         │
│  │  it for you.        │  │  docs updated.      │         │
│  │                     │  │                     │         │
│  │  For: non-technical │  │  For: developers    │         │
│  │  founders           │  │  who want backup    │         │
│  └─────────────────────┘  └─────────────────────┘         │
│                                                             │
│  You can change this anytime in department settings.        │
└─────────────────────────────────────────────────────────────┘
```

**Build It For Me mode — agent behaviour:**
- Ghost: scaffold entire apps from plain English descriptions
- Wren: write README, docs, and deployment configs
- Volt: push to GitHub and deploy to Vercel automatically
- Cipher: run security scan before anything goes live
- Hex: debug and explain errors in plain English

**Build With Me mode — agent behaviour:**
- Ghost: suggest next functions, complete code blocks
- Hex: debug errors you paste in, explain what went wrong
- Cipher: review PRs automatically, flag vulnerabilities
- Wren: keep docs updated as codebase changes
- Volt: handle deployment when you're ready to ship

**Store the mode in the departments table:**
```sql
alter table public.departments
  add column if not exists tech_mode text
  check (tech_mode in ('build_for_me', 'build_with_me'));
```

**System prompt changes per mode:**
Add to Ghost's system prompt:
```
OPERATING MODE: ${dept.tech_mode}

If BUILD_FOR_ME:
- User is non-technical. Never show raw code without explanation.
- Always explain what you're building in plain English first.
- After code output, always add a "What this does" section.
- After generating, automatically brief Volt to deploy.

If BUILD_WITH_ME:
- User is technical. Show raw code directly.
- Skip the plain English explanations.
- Assume they know what they're doing.
- Focus on the specific problem they're stuck on.
```

---

## CHANGE 4 — NEW PRICING ($0 / $29 / $59)

Replace the existing pricing entirely. Three tiers:

### FREE — $0/month (permanent, not a trial)
```
✓ Pick any 2 departments
✓ 6 agents (3 per dept)
✓ 50 tasks per month
✓ 1 team member (just you)
✓ 3 integrations
✓ Basic OrcaHub templates
✓ Community support
```
CTA: **Get Started Free**

### BUILDER — $29/mo · $24/mo annual (billed $290/yr)
```
✓ All 5 departments
✓ All 25 agents
✓ 500 tasks per month
✓ 3 team members
✓ All integrations
✓ Agent coordination feed
✓ Tech dept / vibe coding (both modes)
✓ Full OrcaHub marketplace
✓ Email support
```
CTA: **Start Free Trial**
Badge: **MOST POPULAR**

### PRO — $59/mo · $49/mo annual (billed $590/yr)
```
✓ All 5 departments
✓ All 25 agents
✓ Unlimited tasks
✓ 10 team members
✓ All integrations
✓ Bring your own LLM (OpenAI, Anthropic, Mistral, Gemini, Groq)
✓ Per-department and per-agent model assignment
✓ 5-hop agent coordination chains
✓ Full API access
✓ White-label option
✓ Custom agent training
✓ Priority support
```
CTA: **Start Free Trial**

**Below all cards:**
```
All paid plans include a 14-day free trial. No credit card required. Cancel anytime.
```

**Founding member deal banner (above the pricing cards):**
```
┌─────────────────────────────────────────────────────────┐
│  🔥 FOUNDING MEMBER OFFER — Limited spots remaining     │
│                                                         │
│  Get Builder plan at $19/mo locked forever.             │
│  First 50 founders only. Never increases.               │
│                              [Claim founding spot →]    │
└─────────────────────────────────────────────────────────┘
```

### Update Paystack plans

Create 5 plans in Paystack dashboard:
- Builder Monthly: $29 → env: `PAYSTACK_PLAN_BUILDER_MONTHLY`
- Builder Annual: $290/yr → env: `PAYSTACK_PLAN_BUILDER_ANNUAL`
- Pro Monthly: $59 → env: `PAYSTACK_PLAN_PRO_MONTHLY`
- Pro Annual: $590/yr → env: `PAYSTACK_PLAN_PRO_ANNUAL`
- Founding Member: $19/mo → env: `PAYSTACK_PLAN_FOUNDING`

Update `lib/plans/limits.ts`:
```typescript
export const PLAN_LIMITS = {
  free: {
    departments: 2,
    agents: 6,
    monthly_tasks: 50,
    team_members: 1,
    integrations: 3,
    coordination_feed: false,
    tech_dept: false,
    orcahub: 'basic',
    byollm: false,
    api_access: false,
    coordination_depth: 1,
  },
  builder: {
    departments: 5,
    agents: 25,
    monthly_tasks: 500,
    team_members: 3,
    integrations: 999,
    coordination_feed: true,
    tech_dept: true,
    orcahub: 'full',
    byollm: false,
    api_access: false,
    coordination_depth: 3,
  },
  founding: {  // same as builder but locked at $19
    departments: 5,
    agents: 25,
    monthly_tasks: 500,
    team_members: 3,
    integrations: 999,
    coordination_feed: true,
    tech_dept: true,
    orcahub: 'full',
    byollm: false,
    api_access: false,
    coordination_depth: 3,
  },
  pro: {
    departments: 5,
    agents: 25,
    monthly_tasks: 999999,
    team_members: 10,
    integrations: 999,
    coordination_feed: true,
    tech_dept: true,
    orcahub: 'full',
    byollm: true,
    api_access: true,
    coordination_depth: 5,
    white_label: true,
    custom_agent_training: true,
  },
}
```

---

## CHANGE 5 — NEW FREE INTEGRATIONS TO ADD

Add all of these. They are all free tier and require no payment.

### Brevo (email campaigns — replaces Mailchimp for free users)
**What it powers:** Jackie (email campaigns), Bruce (onboarding sequences)
**Free tier:** 300 emails/day, unlimited contacts
**Get API key:** brevo.com → Sign up → Settings → API Keys → Generate
**Env var:** `BREVO_API_KEY=`
**How agents use it:**
```typescript
// lib/integrations/providers/brevo.ts
import * as SibApiV3Sdk from 'sib-api-v3-sdk'

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!)

export async function sendBrevoCampaign(params: {
  to: string
  subject: string
  htmlContent: string
  senderName: string
  senderEmail: string
}) {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
  sendSmtpEmail.to = [{ email: params.to }]
  sendSmtpEmail.subject = params.subject
  sendSmtpEmail.htmlContent = params.htmlContent
  sendSmtpEmail.sender = {
    name: params.senderName,
    email: params.senderEmail
  }
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}
```
**Install:** `npm install sib-api-v3-sdk`

---

### Tavily (real-time web search for agents)
**What it powers:** Rex (lead research), Roman (competitor tracking),
Sage (market signals), Nate (news monitoring)
**Free tier:** 1,000 API calls/month
**Get API key:** tavily.com → Sign up → API Keys → Create key
**Env var:** `TAVILY_API_KEY=tvly-...`
**How agents use it:**
```typescript
// lib/tools/tavily.ts
export async function tavilySearch(query: string, searchDepth: 'basic' | 'advanced' = 'basic') {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: searchDepth,
      include_answer: true,
      include_raw_content: false,
      max_results: 5,
    }),
  })
  const data = await response.json()
  return data.results as { title: string; url: string; content: string; score: number }[]
}
```

Add as a LangChain tool for Rex, Roman, Sage, Nate, Dex:
```typescript
new DynamicTool({
  name: 'web_search',
  description: 'Search the web for current information. Use for lead research, competitor analysis, market signals, and news.',
  func: async (query: string) => {
    const results = await tavilySearch(query)
    return results.map(r => `${r.title}\n${r.url}\n${r.content}`).join('\n\n')
  }
})
```

---

### Crisp (helpdesk + live chat — replaces Intercom/Zendesk)
**What it powers:** Purity (support tickets), Beatrice (churn alerts)
**Free tier:** Forever free — 1 inbox, unlimited conversations
**Get API key:**
1. Go to crisp.chat → Sign up → Create website
2. Go to Settings → Integrations → API → Generate new token
3. Copy Website ID and API token
**Env vars:**
```env
CRISP_WEBSITE_ID=
CRISP_API_TOKEN=
```
**How agents use it:**
```typescript
// lib/integrations/providers/crisp.ts
export async function getCrispConversations(websiteId: string) {
  const response = await fetch(
    `https://api.crisp.chat/v1/website/${websiteId}/conversations/1`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.CRISP_API_TOKEN}:`
        ).toString('base64')}`,
        'X-Crisp-Tier': 'plugin',
      }
    }
  )
  return response.json()
}
```
**Install:** `npm install crisp-api`

---

### Hunter.io (email finder for Sales)
**What it powers:** Rex (lead prospecting), Mark (outreach)
**Free tier:** 25 searches/month
**Get API key:**
1. Go to hunter.io → Sign up
2. Go to API → Your API key is shown on the page
**Env var:** `HUNTER_API_KEY=`
**How agents use it:**
```typescript
// lib/integrations/providers/hunter.ts
export async function findEmail(domain: string, firstName: string, lastName: string) {
  const url = new URL('https://api.hunter.io/v2/email-finder')
  url.searchParams.set('domain', domain)
  url.searchParams.set('first_name', firstName)
  url.searchParams.set('last_name', lastName)
  url.searchParams.set('api_key', process.env.HUNTER_API_KEY!)

  const response = await fetch(url.toString())
  const data = await response.json()
  return data.data as { email: string; score: number; sources: any[] }
}
```

---

### NewsAPI (live news for Intelligence dept)
**What it powers:** Nate (news monitoring), Sage (market signals)
**Free tier:** 100 requests/day, developer use only
**Get API key:**
1. Go to newsapi.org → Get API Key
2. Sign up with email
3. Your API key is shown immediately on confirmation
**Env var:** `NEWSAPI_KEY=`
**How agents use it:**
```typescript
// lib/integrations/providers/newsapi.ts
export async function getTopNews(query: string, language = 'en') {
  const url = new URL('https://newsapi.org/v2/everything')
  url.searchParams.set('q', query)
  url.searchParams.set('language', language)
  url.searchParams.set('sortBy', 'publishedAt')
  url.searchParams.set('pageSize', '10')
  url.searchParams.set('apiKey', process.env.NEWSAPI_KEY!)

  const response = await fetch(url.toString())
  const data = await response.json()
  return data.articles as {
    title: string
    description: string
    url: string
    publishedAt: string
    source: { name: string }
  }[]
}
```

---

### SerpApi (Google search results for Research)
**What it powers:** Roman (competitor analysis), Lucy (SEO research)
**Free tier:** 100 searches/month
**Get API key:**
1. Go to serpapi.com → Sign up
2. Go to Dashboard → Your API key is shown at the top
**Env var:** `SERPAPI_KEY=`
**How agents use it:**
```typescript
// lib/integrations/providers/serpapi.ts
export async function googleSearch(query: string) {
  const url = new URL('https://serpapi.com/search')
  url.searchParams.set('q', query)
  url.searchParams.set('api_key', process.env.SERPAPI_KEY!)
  url.searchParams.set('engine', 'google')
  url.searchParams.set('num', '10')

  const response = await fetch(url.toString())
  const data = await response.json()
  return data.organic_results as {
    title: string
    link: string
    snippet: string
    position: number
  }[]
}
```

---

### Vercel API (deployments from Wren/Volt)
**What it powers:** Wren (deployment management), Volt (monitoring)
**Free tier:** Generous — unlimited personal projects
**Get API key:**
1. Go to vercel.com → Sign in
2. Go to Settings (top right avatar) → Tokens
3. Click Create Token → name it "ORCA" → scope: Full Account
4. Copy immediately — shown only once
**Env var:** `VERCEL_API_TOKEN=`
**How agents use it:**
```typescript
// lib/integrations/providers/vercel.ts
export async function triggerVercelDeploy(projectId: string) {
  const response = await fetch(
    `https://api.vercel.com/v13/deployments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: projectId, target: 'production' })
    }
  )
  return response.json()
}
```

---

### Sentry (error monitoring for Ghost/Volt)
**What it powers:** Volt (incident response), Ghost (security monitoring)
**Free tier:** 5,000 errors/month
**Get API key:**
1. Go to sentry.io → Sign up
2. Create a new project → select your platform (Next.js)
3. Go to Settings → API → Auth Tokens → Create New Token
4. Scopes needed: `project:read`, `event:read`, `issue:read`
**Env var:** `SENTRY_AUTH_TOKEN=`
**Org and project slugs:**
```env
SENTRY_AUTH_TOKEN=
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

---

### Flutterwave (additional payments — covers more African countries)
**What it powers:** Billing for users in countries Paystack doesn't cover
**Free tier:** No monthly fee — transaction fees only
**Get API key:**
1. Go to flutterwave.com → Create an account
2. Complete business verification
3. Go to Settings → API → Copy Test Secret Key and Test Public Key
**Env vars:**
```env
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-...
```

---

### Lemon Squeezy (merchant of record — handles global tax)
**What it powers:** International billing without a US entity
**Why add it:** Handles VAT, sales tax, and compliance automatically.
Best option for users outside Africa where Paystack doesn't work.
**Free tier:** No monthly fee — 5% + 50¢ per transaction
**Get API key:**
1. Go to lemonsqueezy.com → Sign up
2. Go to Settings → API → Create API Key
3. Create your products and price variants in the dashboard
**Env var:** `LEMONSQUEEZY_API_KEY=`

---

## CHANGE 6 — INTELLIGENCE DEPARTMENT: AUTOMATED WEEKLY BRIEF

Every Monday at 9am, Dex automatically generates and delivers a
weekly brief. This is not triggered by the user — it fires automatically
via Inngest.

Update `lib/inngest/functions/reports.ts`:

```typescript
export const handleWeeklyBrief = inngest.createFunction(
  { id: 'weekly-intelligence-brief' },
  { cron: '0 9 * * 1' }, // Every Monday 9am UTC
  async ({ step }) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all orgs with active Intel department
    const { data: orgs } = await supabase
      .from('departments')
      .select('org_id, organizations(plan)')
      .eq('key', 'intel')
      .eq('agents_paused', false)

    for (const dept of orgs || []) {
      await step.run(`brief-${dept.org_id}`, async () => {
        // Get company context
        const { data: company } = await supabase
          .from('company_identity')
          .select('*')
          .eq('org_id', dept.org_id)
          .single()

        if (!company) return

        // Run Dex to generate the weekly brief
        const brief = await generateWeeklyBrief(company)

        // Save to pending_briefs for user to see in dashboard
        await supabase.from('pending_briefs').insert({
          org_id: dept.org_id,
          agent_name: 'Dex',
          brief_text: brief,
          rationale: 'Your automated weekly intelligence brief — generated every Monday',
          source: 'inngest_cron',
          sent: true,
          sent_at: new Date().toISOString(),
        })
      })
    }
  }
)
```

The weekly brief covers:
- Competitor updates (Roman's data + Tavily search)
- Market signals this week (Sage + NewsAPI)
- News digest (Nate + NewsAPI)
- Trend forecast (Ada + SerpApi)
- Delivered to: Notion (if connected) or in-dashboard notification

---

## CHANGE 7 — LANDING PAGE MESSAGING UPDATE

Update the landing page copy to reflect the new ICP and positioning.

**Hero headline:** Keep — "Your competitors have teams. You have ORCA."

**Hero subheadline — change to:**
```
5 AI departments. 25 coordinated agents.
Built for solo founders who are tired of doing everything alone.
```

**The problem section — update to:**
```
You wake up as the CMO.
By 10am you're the CFO.
Lunch you're handling support.
Afternoon you're back to product.

That's not a company. That's one person cosplaying as 6 jobs.
```

**Social proof — update:**
Remove "join thousands of users" — replace with:
```
Join 200+ founders building in public with ORCA
```

**Add founding member banner on landing page:**
```
🔥 Founding member pricing: Get Builder at $19/mo locked forever.
50 spots only. X remaining.
[Claim your spot →]
```

---

## CHANGE 8 — ONBOARDING UPDATES

### Updated department picker

Show only the 5 active departments as selectable.
Show the 4 coming soon departments greyed out below.

**Free plan:** Pick any 2 from the 5 active departments
**Builder/Pro:** All 5 active departments pre-selected

```
Choose your departments:

[ ] 📣 Marketing
[ ] 💼 Sales & Revenue
[ ] 🤝 Customer Success
[ ] 🔍 Intelligence & Research
[ ] 🛡️ Tech & Vibe Coding

Coming soon — post-launch:
[🔒] 🧠 People & Hiring
[🔒] 📋 Operations
[🔒] 📊 Finance & Legal
[🔒] 🌐 Community & Growth
```

### Tech department mode selection

After the user selects the Tech department, immediately show
the Build For Me / Build With Me toggle screen (see Change 1 above).

---

## CHANGE 9 — FOUNDING MEMBER TRACKING

Add a founding member counter to the database:

```sql
create table public.founding_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  org_id uuid references public.organizations(id),
  spot_number integer not null,
  locked_price numeric(6,2) not null default 19.00,
  created_at timestamptz default now()
);

-- Track total spots
create table public.founding_config (
  id uuid primary key default gen_random_uuid(),
  total_spots integer not null default 50,
  spots_taken integer not null default 0,
  updated_at timestamptz default now()
);

-- Seed with initial config
insert into public.founding_config (total_spots, spots_taken)
values (50, 0);
```

**API route to get remaining spots:**
```typescript
// app/api/founding/status/route.ts
export async function GET() {
  const { data } = await supabase
    .from('founding_config')
    .select('total_spots, spots_taken')
    .single()

  return NextResponse.json({
    total: data?.total_spots,
    taken: data?.spots_taken,
    remaining: (data?.total_spots || 50) - (data?.spots_taken || 0),
    available: (data?.spots_taken || 0) < (data?.total_spots || 50),
  })
}
```

**Show on landing page:** "X founding spots remaining" — fetches
from `/api/founding/status` on page load. Updates in real time.

---

## NEW ENV VARS TO ADD

Add all of these to Vercel and `.env.local`:

```env
# Brevo — email campaigns (free: 300/day)
# Get: brevo.com → Settings → API Keys
BREVO_API_KEY=

# Tavily — real-time web search (free: 1,000/month)
# Get: tavily.com → Dashboard → API Keys
TAVILY_API_KEY=tvly-...

# Hunter.io — email finder (free: 25/month)
# Get: hunter.io → API section on dashboard
HUNTER_API_KEY=

# NewsAPI — live news (free: 100/day)
# Get: newsapi.org → Get API Key → sign up
NEWSAPI_KEY=

# SerpApi — Google search results (free: 100/month)
# Get: serpapi.com → Dashboard (shown at top)
SERPAPI_KEY=

# Crisp — helpdesk (free forever)
# Get: crisp.chat → Settings → Integrations → API
CRISP_WEBSITE_ID=
CRISP_API_TOKEN=

# Vercel — deployments (free tier)
# Get: vercel.com → Settings → Tokens → Create Token
VERCEL_API_TOKEN=

# Sentry — error monitoring (free: 5K errors/month)
# Get: sentry.io → Settings → API → Auth Tokens
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Flutterwave — additional payments (no monthly fee)
# Get: flutterwave.com → Settings → API
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-...

# Lemon Squeezy — merchant of record for global billing
# Get: lemonsqueezy.com → Settings → API → Create Key
LEMONSQUEEZY_API_KEY=

# Updated Paystack plan codes (new pricing)
PAYSTACK_PLAN_BUILDER_MONTHLY=PLN_...
PAYSTACK_PLAN_BUILDER_ANNUAL=PLN_...
PAYSTACK_PLAN_PRO_MONTHLY=PLN_...
PAYSTACK_PLAN_PRO_ANNUAL=PLN_...
PAYSTACK_PLAN_FOUNDING=PLN_...
```

---

## PACKAGES TO INSTALL

```bash
npm install sib-api-v3-sdk     # Brevo email
npm install crisp-api           # Crisp helpdesk
```

Tavily, Hunter, NewsAPI, SerpApi, Vercel, and Sentry all use
native fetch — no extra packages needed.

---

## IMPLEMENTATION ORDER

Do these in this exact order:

1. Update `lib/seed/agentData.ts` — set ACTIVE_DEPT_KEYS
2. Update `lib/seed/seedOrg.ts` — only seed 25 agents for 5 depts
3. Update `lib/plans/limits.ts` — new plan structure (free/builder/founding/pro)
4. Update pricing page — new 3-tier cards + founding member banner
5. Update onboarding — 5 active depts + 4 coming soon greyed out
6. Add tech department mode selection screen (Build For Me / Build With Me)
7. Add `tech_mode` column to departments table
8. Create all new integration providers in `lib/integrations/providers/`
9. Add Tavily as LangChain tool to Rex, Roman, Sage, Nate, Dex
10. Add NewsAPI tool to Nate and Sage
11. Add SerpApi tool to Roman and Lucy
12. Add Hunter.io tool to Rex and Mark
13. Add Crisp integration to Purity
14. Add Brevo integration to Jackie and Bruce
15. Update weekly brief Inngest function to use new tools
16. Add founding member tables to Supabase
17. Add `/api/founding/status` route
18. Update landing page hero subheadline and social proof copy
19. Add founding member banner to landing page and upgrade page
20. Update Paystack — create 5 new plans at new prices
21. Deploy and test

---

## TESTING CHECKLIST

- [ ] New account signup → only 5 departments visible in sidebar
- [ ] 4 coming soon departments show greyed out with lock
- [ ] Free plan → can pick 2 of 5 departments, 6 agents seeded
- [ ] Builder plan → all 5 departments, 25 agents
- [ ] Tech dept → mode selection screen appears on first open
- [ ] Build For Me mode → Ghost explains in plain English
- [ ] Build With Me mode → Ghost responds in technical style
- [ ] Rex brief with "find leads" → Tavily fires and returns results
- [ ] Roman brief with "research competitor" → Tavily + SerpApi fire
- [ ] Nate brief with "news summary" → NewsAPI returns articles
- [ ] Pricing page → Free / Builder / Pro cards with correct features
- [ ] Founding member banner shows remaining spots from DB
- [ ] Founding member spot decrements when claimed
- [ ] Annual/monthly toggle works with new plan codes
- [ ] Paystack checkout → correct new plan code used
- [ ] Weekly brief Inngest function fires on Monday 9am (test with manual invoke)

---

*Nexonic Industries · orca-sigma.vercel.app · Pivot document — March 2026*