# ORCA — OrcaHub Templates Specification
## templates.md · Nexonic Industries · AI Company OS
### What templates are, where they live, how they work, and how they behave

---

## WHAT IS A TEMPLATE?

A template is a pre-built company configuration that a user can install into their ORCA
dashboard in one click. Instead of manually choosing departments, setting operating modes,
picking integrations, and figuring out what to brief each agent on day one — a template
does all of that automatically based on the type of company the user is running.

Think of it like this: when someone opens ORCA for the first time, they face a blank org
chart. A template fills that org chart with the right structure for their business type
immediately — the same way a Notion template fills a blank workspace with the right pages
and databases.

**A template is not just a configuration file. It is a running start.**

---

## WHERE TEMPLATES LIVE

### In the codebase

```
lib/
  seed/
    agentData.ts          ← agent + department data (45 agents, 9 depts)
    seedOrg.ts            ← seeds every new org with all depts + agents
    orcahubTemplates.ts   ← the 6 official template definitions (TypeScript source)

app/
  api/
    orcahub/
      route.ts            ← GET /api/orcahub (list all templates)
      [slug]/
        route.ts          ← GET /api/orcahub/[slug] (single template detail)
        install/
          route.ts        ← POST /api/orcahub/[slug]/install
    onboarding/
      progress/
        route.ts          ← POST /api/onboarding/progress (step 2 uses templates)
```

### In the database

```
public.orcahub_templates    ← all template definitions (seeded from SQL)
public.orcahub_installs     ← tracks which orgs installed which templates
public.pending_briefs       ← Day 1 briefs queued from template install
public.departments          ← updated when template activates departments
```

### In the UI

Templates appear in three places:

1. **Onboarding Step 2** — before the user manually picks departments, ORCA
   suggests the most relevant template based on what they entered in Step 1.
   This is the primary entry point for most users.

2. **Dashboard → OrcaHub page** (`/dashboard/orcahub`) — the full marketplace.
   Browse, filter, preview, and install any template at any time after onboarding.
   Accessible from the sidebar (Owner and Co-founder only).

3. **Command Center — Day 1 Briefs banner** — after a template is installed,
   a banner appears on the dashboard showing the queued briefs. The user sends
   them with one click to activate their agents.

---

## WHAT A TEMPLATE CONTAINS

Every template has the following structure:

```typescript
interface OrcaHubTemplate {
  // Identity
  id: string
  slug: string              // URL-safe identifier e.g. 'saas-startup'
  name: string              // Display name e.g. 'SaaS Startup'
  description: string       // One-paragraph explanation of who this is for
  category: TemplateCategory
  tags: string[]
  author: 'orca_official' | 'community'
  plan_required: 'free' | 'starter' | 'pro' | 'enterprise'
  installs: number          // Community popularity counter
  preview_image_url: string
  published: boolean

  // The actual configuration (stored as JSON in template_data column)
  departments: TemplateDepartment[]
  suggested_integrations: string[]   // service_keys from integration registry
  day1_briefs: Day1Brief[]
}

interface TemplateDepartment {
  key: string                // e.g. 'marketing', 'sales', 'tech'
  agent_mode: 'autopilot' | 'approve_first' | 'suggest_only'
  priority: 'high' | 'medium' | 'low'  // order to show during install
  description: string        // why this dept is included in this template
  active_agents: string[]    // which of the 5 agents to highlight (all 5 are seeded)
}

interface Day1Brief {
  agent_name: string         // which agent receives this brief
  brief: string              // the exact text of the first message to send
  rationale: string          // shown in UI: "why this brief matters on Day 1"
}
```

---

## THE 6 OFFICIAL TEMPLATES

### Template 1 — SaaS Startup
**Slug:** `saas-startup`
**Plan:** Free (accessible to all users)
**For:** Solo founders and early-stage SaaS teams building a product

**Departments activated:**
| Department | Mode | Why |
|-----------|------|-----|
| 📣 Marketing | Approve First | Content and social need human review before publishing |
| 💼 Sales | Approve First | Outreach needs review before sending |
| 🛡️ Tech & Security | Autopilot | Security scans and DevOps can run without constant approval |
| 📋 Operations | Autopilot | Calendar and task management can run autonomously |

**Suggested integrations:** GitHub · Notion · Slack · Google Calendar · LinkedIn · HubSpot

**Day 1 Briefs:**
- **Aria:** *"Write 5 LinkedIn posts introducing our product. Founder tone. Include our waitlist link."*
  Rationale: Gets social presence started immediately with ICP-targeted content.
- **Rex:** *"Find 20 founders in our ICP who have posted about operational challenges in the last 30 days."*
  Rationale: Builds the first lead pipeline with warm, high-intent prospects.
- **Ghost:** *"Scan our main repository for security vulnerabilities. Report any critical issues immediately."*
  Rationale: Catches security issues before they reach production.
- **Atlas:** *"Create a launch week project plan with daily tasks for the next 7 days."*
  Rationale: Gives structure to the first week so nothing falls through the cracks.

---

### Template 2 — Content Marketing Agency
**Slug:** `content-marketing-agency`
**Plan:** Starter ($99/mo+)
**For:** Agencies running content, SEO, and social for multiple clients

**Departments activated:**
| Department | Mode | Why |
|-----------|------|-----|
| 📣 Marketing | Approve First | Client content needs human review before delivery |
| 🔍 Intelligence | Autopilot | Research and monitoring can run continuously |
| 🌐 Community | Approve First | Partnership outreach needs review |
| 📋 Operations | Autopilot | Internal task management runs autonomously |

**Suggested integrations:** LinkedIn · X/Twitter · WordPress · Google Analytics · Ahrefs · Notion · Slack

**Day 1 Briefs:**
- **Jackie:** *"Write a 1,200-word blog post about the top 5 AI tools for small business owners. SEO-optimised, professional tone."*
  Rationale: Produces first content immediately — sets the quality bar.
- **Lucy:** *"Run an SEO audit of our main website. Report the top 10 on-page issues to fix this week."*
  Rationale: Identifies quick SEO wins without needing new content.
- **Roman:** *"Research our top 5 competitors. Summarise their content strategy, publishing frequency, and top performing topics."*
  Rationale: Builds competitive intelligence the whole team will reference.
- **Sage:** *"Monitor our brand name and top 3 competitors on LinkedIn, X, and Reddit for the next 30 days."*
  Rationale: Keeps continuous market watch without manual searching.

---

### Template 3 — E-commerce Operator
**Slug:** `ecommerce-operator`
**Plan:** Starter ($99/mo+)
**For:** DTC brands and online stores

**Departments activated:**
| Department | Mode | Why |
|-----------|------|-----|
| 📣 Marketing | Approve First | Ad copy and social content needs review |
| 💼 Sales | Autopilot | Lead tracking can run autonomously |
| 🤝 Customer Success | Autopilot | Support and onboarding can handle routine issues |
| 📊 Finance | Approve First | Invoices and expenses need human sign-off |

**Suggested integrations:** Meta (Instagram + Facebook) · Mailchimp · Stripe · Intercom · Google Analytics

**Day 1 Briefs:**
- **Aria:** *"Write 5 Instagram captions for our product launch campaign. Bold, energetic tone. Include a call to action."*
  Rationale: Starts social presence for the launch immediately.
- **Eric:** *"Write 3 Facebook ad copy variants for our best-selling product. Pain-solution format."*
  Rationale: Creates ad copy variants ready to test right away.
- **Purity:** *"Create an FAQ document for our 10 most common customer support questions."*
  Rationale: Builds a knowledge base that reduces support volume from day one.
- **Bill:** *"Set up an invoice template for standard product orders including payment terms."*
  Rationale: Creates professional invoicing before the first sale.

---

### Template 4 — Recruiting Firm
**Slug:** `recruiting-firm`
**Plan:** Pro ($199/mo+)
**For:** Boutique recruitment agencies

**Departments activated:**
| Department | Mode | Why |
|-----------|------|-----|
| 🧠 People & Hiring | Approve First | All candidate activity needs human oversight |
| 💼 Sales | Approve First | Client outreach needs review |
| 🔍 Intelligence | Autopilot | Market research runs continuously |
| 📋 Operations | Autopilot | Internal management runs autonomously |

**Suggested integrations:** LinkedIn (Hiring) · Workable · Gmail · HubSpot · Notion

**Day 1 Briefs:**
- **Marcus:** *"Source 10 senior software engineering candidates who are open to work and based in East Africa."*
  Rationale: Fills the first candidate pipeline immediately.
- **Vera:** *"Create a screening scorecard for senior software engineers with technical, cultural, and red flag criteria."*
  Rationale: Standardises the screening process before the first interview.
- **Rex:** *"Find 10 fast-growing startups likely to need engineering hires in the next 90 days."*
  Rationale: Builds a client prospect list with companies in active hiring mode.
- **Zara:** *"Create a background verification checklist covering employment history, references, and identity."*
  Rationale: Establishes a repeatable verification process before the first placement.

---

### Template 5 — Dev Agency
**Slug:** `dev-agency`
**Plan:** Pro ($199/mo+)
**For:** Software development agencies

**Departments activated:**
| Department | Mode | Why |
|-----------|------|-----|
| 🛡️ Tech & Security | Approve First | Code deployments and reviews need human sign-off |
| 📋 Operations | Autopilot | Project management and coordination runs autonomously |
| 💼 Sales | Approve First | Client outreach needs review |
| 📊 Finance | Approve First | Invoices and contracts need human sign-off |

**Suggested integrations:** GitHub · Linear · Vercel · HubSpot · Notion · Stripe · DocuSign

**Day 1 Briefs:**
- **Cipher:** *"Review our GitHub repository structure and suggest improvements to our PR review process."*
  Rationale: Establishes code quality standards before the next PR.
- **Hex:** *"Create a README template for client project repositories with setup, architecture, and contribution guidelines."*
  Rationale: Creates a documentation standard the whole team uses.
- **Rex:** *"Find 10 funded startups that recently launched a product and likely need development support."*
  Rationale: Builds a warm prospect list of companies in active build mode.
- **Lena:** *"Draft a standard software development contract with scope, payment terms, IP ownership, and termination clauses."*
  Rationale: Creates a legally sound contract template ready to customise per client.

---

### Template 6 — Intelligence & Research Desk
**Slug:** `intelligence-research-desk`
**Plan:** Pro ($199/mo+)
**For:** Research teams, think tanks, competitive intelligence desks

**Departments activated:**
| Department | Mode | Why |
|-----------|------|-----|
| 🔍 Intelligence | Autopilot | All 5 research agents run continuously and autonomously |
| 🌐 Community | Approve First | Partnership outreach needs review |
| 📋 Operations | Autopilot | Notes and project management run autonomously |

**Suggested integrations:** Perplexity · Semrush · Ahrefs · Notion · Slack

**Day 1 Briefs:**
- **Roman:** *"Research the AI Company OS market. Identify all players, positioning, pricing, and target customers. Deliver a competitive landscape report."*
  Rationale: Builds foundational competitive intelligence the whole team references.
- **Sage:** *"Set up monitoring for: AI agents, AI company OS, autonomous company — on LinkedIn, X, and Reddit. Alert on significant activity."*
  Rationale: Establishes continuous market surveillance from day one.
- **Nate:** *"Create a weekly intelligence brief template with sections for: market movements, competitor updates, technology signals, funding news, key takeaways."*
  Rationale: Defines the brief format the team will use every week.
- **Ada:** *"Build a 6-month growth forecast for the AI tools market. Include TAM estimate, growth rate assumptions, and key risk factors."*
  Rationale: Gives research a quantitative foundation for strategic planning.

---

## HOW TEMPLATE SELECTION WORKS (Onboarding Step 2)

When a user completes Step 1 of onboarding, ORCA analyses their answers and
suggests the most relevant template. This matching happens client-side using
the data from Step 1.

### Matching Logic

```typescript
// lib/templates/matchTemplate.ts

interface OnboardingStep1Data {
  industry: string
  stage: string
  mission: string
  icp: string
}

export function matchTemplate(data: OnboardingStep1Data): string | null {
  const { industry, stage, mission } = data
  const missionLower = mission.toLowerCase()

  // SaaS Startup
  if (
    ['saas', 'software', 'technology', 'internet'].includes(industry) &&
    ['pre_revenue', 'early_revenue'].includes(stage)
  ) return 'saas-startup'

  // Dev Agency — tech + mentions building/developing
  if (
    ['software', 'technology'].includes(industry) &&
    (missionLower.includes('build') || missionLower.includes('develop') ||
     missionLower.includes('agency') || missionLower.includes('client'))
  ) return 'dev-agency'

  // Recruiting Firm — mentions hiring/talent
  if (
    missionLower.includes('hire') || missionLower.includes('talent') ||
    missionLower.includes('recruit') || missionLower.includes('staffing')
  ) return 'recruiting-firm'

  // E-commerce
  if (
    ['ecommerce', 'retail', 'consumer'].includes(industry) ||
    missionLower.includes('sell') || missionLower.includes('store') ||
    missionLower.includes('product') && missionLower.includes('buy')
  ) return 'ecommerce-operator'

  // Content Agency — marketing/agency focus
  if (
    ['marketing_advertising', 'media', 'content'].includes(industry) ||
    missionLower.includes('content') || missionLower.includes('marketing agency')
  ) return 'content-marketing-agency'

  // Intelligence/Research
  if (
    missionLower.includes('research') || missionLower.includes('intelligence') ||
    missionLower.includes('analysis') || missionLower.includes('insights')
  ) return 'intelligence-research-desk'

  // No match — show all templates for manual selection
  return null
}
```

### What the UI shows

**If a match is found:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏪  We found a template for you                             │
│                                                             │
│  The SaaS Startup template matches your company stage.      │
│  It activates Marketing, Sales, Tech & Security, and Ops    │
│  with recommended operating modes and 4 Day 1 briefs        │
│  ready to send.                                             │
│                                                             │
│  [Use SaaS Startup Template →]    [Build manually]          │
└─────────────────────────────────────────────────────────────┘
```

**If no match — show all templates as a small grid:**
```
┌──────────────────────────────────────────────────────────────┐
│ 🏪  Start with a template                                    │
│  Or build your org chart manually below.                     │
│                                                             │
│  [🚀 SaaS Startup] [📣 Marketing Agency] [🛒 E-commerce]    │
│  [💼 Recruiting]   [🛠️ Dev Agency]       [🔍 Research]      │
│                                                             │
│  [Skip — build manually ↓]                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## WHAT HAPPENS WHEN A TEMPLATE IS INSTALLED

This is the complete sequence of events from click to fully activated company.

### 1. User clicks "Install" (or "Use this template")

The frontend calls:
```
POST /api/orcahub/[slug]/install
```

### 2. Backend validates

- Checks user is Owner or Co-founder (Members cannot install)
- Checks the org plan meets the template's `plan_required`
- Checks the template isn't already installed (returns 409 if so)
- If all pass → proceeds to activation

### 3. Departments are activated

For each department in `template.departments`:

```typescript
// Upsert the department with the template's recommended agent_mode
await supabase.from('departments').upsert({
  org_id: orgId,
  key: deptConfig.key,
  name: getDeptName(deptConfig.key),
  icon: getDeptIcon(deptConfig.key),
  agent_mode: deptConfig.agent_mode,  // ← set by template
  agents_paused: false,
}, { onConflict: 'org_id,key' })
```

Departments not included in the template remain in their current state.
They are not deleted or deactivated — they just don't change.

### 4. Agents are confirmed seeded

Since `seedNewOrg()` already ran at signup, all 45 agents already exist.
The install step checks each department has its 5 agents and seeds
any that are missing (idempotent — safe to call multiple times).

### 5. Day 1 briefs are queued

For each `day1_brief` in the template:

```typescript
await supabase.from('pending_briefs').insert({
  org_id: orgId,
  agent_id: agent.id,          // looked up by agent name
  brief_text: brief.brief,     // the pre-written brief text
  rationale: brief.rationale,  // shown in UI
  source: 'orcahub',
  template_slug: slug,
  dismissed: false,
  sent: false,
})
```

These are NOT sent automatically. They sit in `pending_briefs` as drafts.
The user reviews and sends each one from the Day 1 Briefs panel.

### 6. Install is recorded

```typescript
await supabase.from('orcahub_installs').insert({
  org_id: orgId,
  template_id: template.id,
  installed_by: user.id,
})
```

### 7. Install counter increments

```sql
update public.orcahub_templates
set installs = installs + 1
where id = p_template_id;
```

### 8. Audit log entry written

```typescript
await writeAuditLog({
  orgId,
  actorUserId: user.id,
  action: 'orcahub_template_installed',
  metadata: { template_slug: slug, template_name: template.name }
})
```

### 9. Response returned to frontend

```typescript
return NextResponse.json({
  installed: true,
  departments_activated: 4,
  day1_briefs_queued: 4,
  suggested_integrations: ['github', 'notion', 'slack', 'linkedin', 'hubspot'],
})
```

### 10. Frontend reacts

On receiving `{ installed: true }`:

1. **Template card updates:** Button changes from "Install →" to "✓ Installed" (disabled)
2. **Sidebar updates:** Departments dropdown now shows the newly activated departments
3. **Command Center banner appears:**

```
┌────────────────────────────────────────────────────────────────┐
│ 🏪  Your SaaS Startup template is live                   [✕]  │
│                                                                │
│  4 agents have Day 1 briefs ready.                             │
│  Send them to activate your full company setup.               │
│                                                                │
│  [View & Send Day 1 Briefs →]                                  │
└────────────────────────────────────────────────────────────────┘
```

4. **OrcaHub page updates:** `is_installed: true` on that template card

---

## THE DAY 1 BRIEFS PANEL

After install, the user opens the Day 1 Briefs panel.
This is either a full page at `/dashboard/orcahub/briefs`
or a slide-over panel triggered from the Command Center banner.

### What the panel shows

For each `pending_brief` record for this org:

```
┌──────────────────────────────────────────────────────────────┐
│  🎙️  Aria · Social Media Manager                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Write 5 LinkedIn posts introducing our product.      │   │
│  │ Founder tone. Include our waitlist link.             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  💡 Aria gets your social presence started immediately       │
│     with content that attracts your ICP.                     │
│                                                              │
│  [Send brief →]  [Skip]                                      │
└──────────────────────────────────────────────────────────────┘
```

- The brief text is **editable** before sending. The user can modify it.
- The rationale is shown in italic below the brief — explains why this matters.
- Send button → creates a new conversation with the agent and sends the brief
- Skip button → marks `dismissed: true` on that `pending_brief` record

### What happens when "Send brief →" is clicked

1. Creates a new `conversations` record linking the user + agent + dept
2. Sends the brief text as the first `messages` row (sender_type: 'user')
3. Triggers the AI agent response (same flow as manual briefing)
4. Updates `pending_briefs` record: `sent: true`, `sent_at: now()`
5. Brief card updates to show "✓ Sent" with the agent's response loading

### What happens when all briefs are sent or dismissed

The Day 1 Briefs banner on the Command Center disappears.
The user's dashboard is now fully live with active agents.

---

## HOW AGENTS RESPOND TO TEMPLATE BRIEFS

Template briefs are sent through the exact same AI pipeline as manual briefs.
The agent receives:

1. **The brief text** — the pre-written Day 1 brief from the template
2. **Company context** — mission, brand voice, ICP, industry from `company_identity`
3. **Agent system prompt** — the agent's role, department, and ORCA operating rules
4. **Conversation history** — empty for Day 1 (this is the first message)

Because the user completed onboarding Step 1 before installing the template,
the agent already has full company context. The brief is personalised to their
actual company from the first message.

**Example of what Aria receives internally:**

```
You are Aria, the Social Media Manager at Nexonic Industries.

COMPANY CONTEXT:
- Company: Nexonic Industries
- Industry: SaaS
- Mission: Build the AI Company OS for lean teams
- Brand voice: Bold
- Ideal Customer: Solo founders and early-stage startups 1-15 people
- Geography: Global, English-speaking markets
- Competitors: [Paperclip, Lindy, Relevance AI]

YOUR ROLE:
You are the Social Media Manager. You plan, write, and schedule
content across LinkedIn, X, Instagram, and other channels.

USER BRIEF:
Write 5 LinkedIn posts introducing our product.
Founder tone. Include our waitlist link.
```

The response will be specific to Nexonic Industries — bold tone, founder voice,
referencing the AI Company OS value prop — not a generic template response.

---

## OPERATING MODES SET BY TEMPLATES

Each template sets a recommended `agent_mode` per department. This is the most
important configuration decision the template makes on the user's behalf.

### Why it matters

If a Dev Agency template set all departments to Autopilot, Ghost (the security
scanner) could automatically deploy code to production without human review.
That's dangerous. So the Dev Agency template sets Tech to Approve First.

If a Research Desk template set Intelligence to Approve First, Roman would
produce research reports but wait for approval before doing anything — which
defeats the purpose of a fully autonomous research operation. So the template
sets Intelligence to Autopilot.

The template author (ORCA) has thought through the risk level for each
department in each business type and set the appropriate default.

### Users can always override

After install, the user can change any department's mode from:
**Account Settings → Agent Permissions**

The template sets the starting point. The user stays in control.

---

## MULTIPLE TEMPLATE INSTALLS

A user can install more than one template. Example:

- Install SaaS Startup → activates Marketing, Sales, Tech, Ops
- Later upgrade to Pro and install Intelligence & Research Desk → activates Intel

The second install only affects departments not already configured.
If a department already has a mode set, the new template does NOT override it
unless the user explicitly confirms.

**Conflict resolution UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  Department conflict                                         │
│                                                                 │
│  Marketing is already set to Approve First from your           │
│  SaaS Startup template.                                        │
│                                                                 │
│  The Content Marketing Agency template recommends Approve First. │
│  No change needed — they match.                                │
│                                                                 │
│  [Continue install →]   [Cancel]                               │
└─────────────────────────────────────────────────────────────────┘
```

If modes conflict, ask which to keep. If they match, install silently.

---

## COMMUNITY TEMPLATES (ENTERPRISE)

Enterprise users can publish their own org configuration as a community template.

### How it works

1. Owner goes to OrcaHub → "Publish a template"
2. Fills in: name, description, category, tags
3. ORCA exports their current department configuration as a template
4. Template is submitted for review (not immediately published)
5. ORCA team reviews within 48 hours
6. Approved templates appear in OrcaHub with `author: 'community'` tag

### Community template rules

- Must have at least 2 departments configured
- Must include at least 1 Day 1 brief per department
- Cannot include sensitive company data (ICP, competitors, API keys)
- Template data is sanitised before publishing — company_identity fields stripped
- Author is shown as the org name (not personal name) unless user chooses otherwise

### Community template display

Community templates show differently from official templates:

```
┌────────────────────────────────────────────────────────┐
│  🛒  Shopify DTC Brand                                 │
│  Community template · by Kale Francis                  │
│                                                        │
│  Marketing · Customer Success · Finance                │
│  3 departments · 15 agents                             │
│                                                        │
│  "Built for Shopify brands running DTC with a          │
│  lean team. Tested on our own store."                  │
│                                                        │
│  ★★★★☆  42 installs                                   │
│                                                        │
│  [Preview →]  [Install →]                              │
└────────────────────────────────────────────────────────┘
```

Community templates have a star rating. Users can rate after 7 days of use.

---

## TEMPLATE ANALYTICS (ORCA INTERNAL)

Track these metrics per template to improve the official set:

| Metric | How measured |
|--------|-------------|
| Install rate | installs / views |
| Day 1 brief send rate | sent / queued |
| Brief skip rate | dismissed / queued |
| 7-day retention | user still active 7 days after install |
| First agent brief after install | time between install and first manual brief |
| Most skipped brief | which brief gets dismissed most often |
| Upgrade rate | Free users who installed a template and then upgraded |

The most skipped brief is the most important signal — it means the brief
isn't right for that business type and needs to be rewritten.

---

## TEMPLATE CHECKLIST FOR ANTIGRAVITY

- [ ] `orcahub_templates` table exists in Supabase with RLS
- [ ] `orcahub_installs` table exists with unique(org_id, template_id)
- [ ] `pending_briefs` table exists with sent/dismissed tracking
- [ ] All 6 official templates seeded via SQL (see `backend_connect.md` Step 5)
- [ ] `GET /api/orcahub` returns templates with `is_installed` + `is_accessible` flags
- [ ] `GET /api/orcahub/[slug]` returns single template with full `template_data`
- [ ] `POST /api/orcahub/[slug]/install` activates depts + queues briefs + records install
- [ ] `lib/templates/matchTemplate.ts` exists with matching logic
- [ ] Onboarding Step 2 calls `matchTemplate()` and shows suggestion banner if match found
- [ ] Day 1 Briefs panel shows pending briefs with rationale text
- [ ] Send brief button creates conversation + sends message through AI pipeline
- [ ] Skip button marks `dismissed: true` on pending_brief record
- [ ] Command Center banner shows after install and disappears when all briefs sent/dismissed
- [ ] OrcaHub page shows "✓ Installed" on already-installed templates
- [ ] Multiple template installs handled — dept conflict UI shown when modes differ
- [ ] `increment_template_installs` SQL function deployed
- [ ] Community publishing route live for Enterprise (with review gating)
- [ ] Test: install SaaS Startup → 4 depts activated → 4 briefs in pending_briefs table
- [ ] Test: send a Day 1 brief → conversation created → AI responds with company context
- [ ] Test: install same template twice → 409 returned cleanly
- [ ] Test: Free user tries to install Pro template → 403 with upgrade prompt
- [ ] Test: Member tries to install template → 403 with correct error message

---

*Nexonic Industries · nexonic-industries.vercel.app*
