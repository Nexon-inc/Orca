# ORCA — Major Product Update
## change.md · Complete implementation instructions for Antigravity
### Read every section fully before touching any file.
### If something is not found where described — search the codebase for it by name, then decide: rename, remove, or replace as indicated.

---

## OVERVIEW OF ALL CHANGES

| # | What | Action |
|---|------|--------|
| 1 | Overview page | Rename to Chat + full redesign |
| 2 | Sidebar recents | Add recent conversations like Claude |
| 3 | Departments in sidebar | Remove from nav only |
| 4 | Integrations in sidebar | Remove from nav — move to OrcaHub |
| 5 | Account in sidebar | Remove from nav |
| 6 | User profile avatar | Add to sidebar bottom |
| 7 | OrcaHub | Add two tabs: Templates + Integrations |
| 8 | Projects | New sidebar item for multi-company |
| 9 | Review, Teams, Upgrade | Update copy and pricing |
| 10 | Executive team titles | Add role titles to department heads |
| 11 | Autonomous mode | Add toggle for fully autonomous operation |
| 12 | Final sidebar structure | Definitive order and layout |

---

## CHANGE 1 — RENAME OVERVIEW → CHAT + FULL REDESIGN

### Search and rename
Search the entire codebase for any of these and rename/update:
- Folder `app/(dashboard)/dashboard/overview/` → rename to `chat`
- Any nav or sidebar component showing `Overview` → rename to `Chat`
- Any page title, meta title, or heading saying `Overview` → rename to `Chat`
- Route `/dashboard/overview` → rename to `/dashboard/chat`
- The default route `/dashboard` → redirect to `/dashboard/chat`
- Any component called `Overview`, `OverviewPage`, `CommandCenter`, `command-center`, `command_center` → these are the old overview — replace with the new Chat page

### What the new Chat page looks like

The Chat page is the first thing every user sees on login and signup.
It is a clean, centered AI chat interface in ORCA's dark green theme.

**Empty state (first login or no conversations yet):**

```
┌─────────────────────────────────────────────────────────────────┐
│  Sidebar  │                                                      │
│           │                                                      │
│           │           Good morning, [First name].               │
│           │        What would you like to work on today?        │
│           │                                                      │
│           │                                                      │
│           │  [📣 Marketing] [💼 Sales] [🤝 Customer Success]   │
│           │  [🔍 Intelligence] [🛡️ Tech & Vibe Coding]          │
│           │                                                      │
│           │  ┌─────────────────────────────────────────────┐   │
│           │  │  Ask anything or pick a department above... │   │
│           │  │                                     [+] [↑] │   │
│           │  └─────────────────────────────────────────────┘   │
│           │                                                      │
│           │  ⬡ ORCA agents can make mistakes.                   │
│           │    Always review outputs before approving actions.   │
└─────────────────────────────────────────────────────────────────┘
```

**Greeting:**
- `Good morning, [First name].` — changes based on time of day
  - 5am-11:59am → Good morning
  - 12pm-4:59pm → Good afternoon
  - 5pm-4:59am → Good evening

**Department pills:**
- 5 clickable pills — one per active department
- Clicking a pill routes to `/dashboard/department/[key]`
- Same styling as existing department tabs

**Input bar:**
- Placeholder: `Ask anything or pick a department above...`
- `+` button for file uploads (from frontend_updates.md spec)
- `↑` send button (green, same as current)
- Height: compact 52px, expands to 120px max as user types

**When user sends a message from Chat (not from a dept):**
1. Route the brief through the smart department router (Groq)
2. Router picks the best department + agent
3. Agent response appears in the thread with this format:
```
┌─────────────────────────────────────────────────────┐
│  🎙️  ARIA                                           │
│  Chief Marketing Officer · Marketing                │
│                                                     │
│  Here are 5 LinkedIn posts for your launch...      │
│  [full response]                                    │
│                                                     │
│  [📋 Copy]  [✓ Approve]  [↩ Retry]  [✗ Dismiss]   │
└─────────────────────────────────────────────────────┘
```

**After first message is sent:**
- Greeting and department pills disappear
- Conversation thread takes the full area
- Input bar stays fixed at the bottom

**Conversation persistence:**
- Every conversation in Chat is saved to the `conversations` table
- Conversations appear in the sidebar recents automatically

**Disclaimer (always visible below input bar):**
```
⬡  ORCA agents can make mistakes. Always review outputs before approving actions.
```
Font: 11px, color: rgba(255,255,255,0.3), centered, never bold.

---

## CHANGE 2 — SIDEBAR RECENT CONVERSATIONS

Add a recents section to the sidebar below the main nav items.
This works exactly like Claude's sidebar recents.

**What it looks like (expanded sidebar):**

```
│  ─────────────────────  │
│  RECENT                 │  ← section label, 10px muted text
│  ─────────────────────  │
│  Write 5 LinkedIn posts │  ← truncated at 35 chars
│  Find leads in SaaS...  │
│  Scan codebase for bugs │
│  Weekly intel brief     │
│  + 4 more               │  ← shows if >4 recents
│  ─────────────────────  │
```

**Implementation:**

```typescript
// GET /api/conversations?limit=8
// Returns most recent 8 conversations ordered by updated_at DESC
// Each item: { id, preview_text, dept_key, agent_name, updated_at }

// preview_text = first 35 chars of the first user message
```

Clicking a recent item → navigates to `/dashboard/chat?conversation=[id]`
and loads that conversation thread.

On hover → show `...` icon on the right side of the item.
Clicking `...` → show Delete option only.

**Collapsed sidebar:**
Recents are hidden when sidebar is collapsed to 56px.

**Sidebar width states:**
- Collapsed: 56px (icons only)
- Expanded: 240px (icons + labels + recents)
- Toggle button: small arrow `›` / `‹` at the top right of the sidebar
- Store state in `localStorage('sidebar_collapsed')`

---

## CHANGE 3 — REMOVE DEPARTMENTS FROM SIDEBAR NAV & keep thme in Chat

Search for:
- Any sidebar/nav component with a `Departments` or `departments` item
- Any nav link pointing to `/dashboard/departments`

**Remove the nav item entirely.**

**Do NOT delete:**
- `/dashboard/department/[key]` pages — these still exist and work
- Department workspace components — keep all of them
- Any department-related API routes

Departments are now accessed only through:
1. The 5 department pills in the Chat page
2. The department badge on an agent response card (clicking it goes to that dept) but it opnes in chat 
3. Direct URL navigation to `/dashboard/department/[key]`

---

## CHANGE 4 — REMOVE INTEGRATIONS FROM SIDEBAR NAV

Search for:
- Any sidebar/nav component with an `Integrations` or `integrations` item
- Any nav link pointing to `/dashboard/integrations`

**Remove the nav item from the sidebar.**

**Do NOT delete:**
- The integrations page component — it moves to OrcaHub tab 2
- Any integration API routes
- The integrations page itself

Add this redirect so old links still work:
```typescript
// app/(dashboard)/dashboard/integrations/page.tsx
import { redirect } from 'next/navigation'
export default function IntegrationsRedirect() {
  redirect('/dashboard/orcahub?tab=integrations')
}
```

---

## CHANGE 5 — REMOVE ACCOUNT FROM SIDEBAR NAV

Search for:
- Any sidebar/nav component with an `Account` or `account` item
- Any nav link pointing to `/dashboard/account`

**Remove the nav item from the sidebar.**

**Do NOT delete:**
- `/dashboard/account` page — it still exists
- All account settings pages and routes
- Billing, AI Models, Security settings

Account is now accessed only through the user profile avatar
at the bottom of the sidebar (see Change 6).

---

## CHANGE 6 — USER PROFILE AVATAR AT SIDEBAR BOTTOM

Add a user profile section to the very bottom of the sidebar.
Styled like Claude's sidebar profile but in ORCA's dark green theme.

**Expanded sidebar:**
```
│  ┌──────────────────────────────────┐  │
│  │  [KF]  Kale Francis          ▾  │  │
│  └──────────────────────────────────┘  │
```

**Collapsed sidebar:**
```
│  [KF]  │
```

**Avatar:**
- If user has a profile photo → show circular photo (32px diameter)
- If no photo → show circular avatar with initials in ORCA green (#00FF87)
  on dark background (#1a2e1a)

**Initials logic:**
```typescript
function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  // "Kale Francis" → "KF"
  // "John" → "JO"
}
```

**On click → popup menu appears above the avatar:**
```
┌───────────────────────────────┐
│  Kale Francis                 │
│  nexonicindustries@gmail.com  │
│  ─────────────────────────    │
│  ⚙️  Account Settings         │  → /dashboard/account
│  💳  Billing                  │  → /dashboard/account?tab=billing
│  🤖  AI Models                │  → /dashboard/account?tab=ai-models
│  🔒  Security & Audit         │  → /dashboard/account?tab=security
│  ─────────────────────────    │
│  🚪  Log out                  │  → signOut() + redirect to /
└───────────────────────────────┘
```

**Log out implementation:**
```typescript
async function handleLogout() {
  await supabase.auth.signOut()
  router.push('/')
}
```

**Popup closes** when user clicks anywhere outside of it.

---

## CHANGE 7 — ORCAHUB: TWO TABS

The OrcaHub page gets a two-tab layout. Everything stays — just reorganised.

**Tab navigation:**
```
ORCAHUB
┌─────────────┬──────────────┐
│  🏪 Templates │  🔌 Integrations │
└─────────────┴──────────────┘
```

URL parameter: `/dashboard/orcahub?tab=templates` (default)
and `/dashboard/orcahub?tab=integrations`

**Tab 1 — Templates (default)**
Everything currently on OrcaHub stays exactly here:
- 6 official template cards
- Filter pills: All · Startup · Marketing · E-commerce · Technology · Research
- Plan badges per template
- Install buttons

**Tab 2 — Integrations**
Move the entire integrations page here.
This includes all content from `/dashboard/integrations`:
- OAuth integration cards (GitHub, Google, LinkedIn, Slack, Notion, HubSpot, Meta, Twitter)
- Connect / Disconnect buttons per integration
- API key integrations section (Ahrefs, Apollo, Hunter, etc.)
- Integration status indicators (Connected green / Not connected grey)

**Redirect old route:**
```typescript
// /dashboard/integrations → /dashboard/orcahub?tab=integrations
```

**Tab switching:**
Use URL query param `?tab=` so the back button works correctly.
Read the `tab` param on page load and show the correct tab.

---

## CHANGE 8 — PROJECTS PAGE (Multi-company)

Add a new sidebar item: **Projects**
Route: `/dashboard/projects`

**Sidebar item position:** Third item (after OrcaHub, before Teams)
Icon: 📁

**Projects page layout:**

```
PROJECTS
Your companies — all in one place.

┌─────────────────────────────────────────────────────────────┐
│  ●  ORCA by Nexonic                                 Active  │
│     5 departments · 25 agents · Builder plan               │
│                                              [Switch →]     │
├─────────────────────────────────────────────────────────────┤
│  [+ Add another company]                                    │
│  Builder: up to 3 · Pro: unlimited                         │
└─────────────────────────────────────────────────────────────┘
```

**Company switcher in top bar:**

Add to the very top left of the dashboard, next to the ORCA logo:

```
⬡ ORCA  │  Nexonic Industries  ▾
```

Clicking the dropdown:
```
┌───────────────────────────────┐
│  ●  ORCA by Nexonic  ✓        │  ← active (checkmark)
│  ─────────────────────────    │
│  + Add another company        │
└───────────────────────────────┘
```

**Add company modal (triggered by "+ Add another company"):**
```
┌─────────────────────────────────────────────┐
│  New Company                           [✕]  │
│                                             │
│  Company name *                             │
│  [                                    ]     │
│                                             │
│  Industry                                   │
│  [SaaS ▾]                                  │
│                                             │
│  Start with a template                      │
│  ○ Blank start                             │
│  ○ SaaS Startup (recommended)              │
│  ○ Agency                                  │
│  ○ E-commerce                              │
│                                             │
│  [Cancel]           [Create Company →]      │
└─────────────────────────────────────────────┘
```

**On "Create Company":**
1. Validate company name is not empty
2. Create new org in `organizations` table for this user_id
3. Seed departments and agents based on current plan
4. Set `active_org_id` in session/localStorage
5. Close modal
6. Redirect to `/dashboard/chat` with new company context

**Plan limits (add to `lib/plans/limits.ts`):**
```typescript
free:    { max_companies: 1 },
builder: { max_companies: 3 },
pro:     { max_companies: 999 },
```

**If Free plan and user tries to add second company:**
```
┌────────────────────────────────────────────────┐
│  Upgrade to run multiple companies             │
│                                                │
│  Builder plan — run up to 3 companies          │
│  Pro plan — unlimited companies                │
│                                                │
│  [Cancel]        [View plans →]                │
└────────────────────────────────────────────────┘
```

**Switching companies:**
- Updates `active_org_id` in localStorage and session
- Reloads the dashboard with the new org's departments, agents, conversations
- The company name in the top bar updates
- Sidebar recents update to show the new company's conversations

**Empty state for Projects (only 1 company):**
```
Running multiple ideas?

Add another company and switch between them instantly.
Each company gets its own executive team and integrations.

Builder: up to 3 companies
Pro: unlimited

[+ Add another company]   [Upgrade to Builder →]
```

---

## CHANGE 9 — UPDATE REVIEW, TEAMS, UPGRADE

### Review
Keep all functionality from `frontend_updates.md`.
No structural changes.
Route: `/dashboard/review`
Sidebar label: Review
Icon: 🔍

### Teams
Keep all functionality from `frontend_updates.md`.
Update the plan limits shown on the Teams page to match pivot pricing:
- Free: 1 member (just you)
- Builder: up to 3 members
- Pro: up to 10 members

### Upgrade page
Replace ALL pricing with the pivot pricing from `pricing.md`:

**Free — $0/month (permanent)**
```
Pick any 2 departments
6 agents
50 tasks/month
1 company
Community support
```
CTA: Get Started Free

**Builder — $29/month · $24/month annual ($290/year)**
```
All 5 departments
All 25 agents
500 tasks/month
3 companies
3 team members
All integrations
Coordination feed
Autonomous mode
Email support
```
CTA: Start Free Trial
Badge: MOST POPULAR

**Pro — $59/month · $49/month annual ($590/year)**
```
Everything in Builder
Unlimited tasks
Unlimited companies
10 team members
Bring your own AI model
Per-agent model assignment
Full API access
Priority support
```
CTA: Start Free Trial

**Founding member banner (above all cards):**
```
🔥  Founding offer — $19/month locked forever.
    First 50 founders only. X spots remaining.
    [Claim founding spot →]
```

**Below all cards:**
```
All paid plans include a 14-day free trial. No credit card required.
```

---

## CHANGE 10 — EXECUTIVE TEAM TITLES FOR DEPARTMENT HEADS

### Database migration
```sql
-- Add columns
alter table public.agents
  add column if not exists csuite_title text;

alter table public.agents
  add column if not exists is_department_head boolean default false;

-- Set titles on department head agents
update public.agents set
  csuite_title = 'Chief Marketing Officer',
  is_department_head = true
where lower(name) = 'aria';

update public.agents set
  csuite_title = 'Chief Sales Officer',
  is_department_head = true
where lower(name) = 'rex';

update public.agents set
  csuite_title = 'Chief Customer Officer',
  is_department_head = true
where lower(name) = 'purity';

update public.agents set
  csuite_title = 'Chief Intelligence Officer',
  is_department_head = true
where lower(name) = 'roman';

update public.agents set
  csuite_title = 'Chief Technology Officer',
  is_department_head = true
where lower(name) = 'ghost';
```

### Agent card display
Update the agent card component to show csuite_title when present:

```
Before:
┌──────────────────────────────┐
│  🎙️  ARIA                   │
│  Social Media Manager        │
│  ● STATUS: OPTIMAL           │
└──────────────────────────────┘

After:
┌──────────────────────────────┐
│  🎙️  ARIA                   │
│  Chief Marketing Officer     │  ← csuite_title (green, 11px)
│  ● STATUS: OPTIMAL           │
└──────────────────────────────┘
```

### Chat input placeholder per department
Update these 5 placeholders:
- Marketing: `Message your Chief Marketing Officer...`
- Sales: `Message your Chief Sales Officer...`
- Customer Success: `Message your Chief Customer Officer...`
- Intelligence: `Message your Chief Intelligence Officer...`
- Tech: `Message your Chief Technology Officer...`

### Onboarding completion screen
```
Your executive team is ready.

🎙️ Aria          💼 Rex          🤝 Purity
Chief Marketing  Chief Sales     Chief Customer
Officer          Officer         Officer

🔍 Roman                 🛡️ Ghost
Chief Intelligence       Chief Technology
Officer                  Officer

Brief them in Chat. They coordinate automatically.

[Go to Chat →]
```

### Agent response format in Chat
When an agent responds in the Chat page, the response header shows:
```
🎙️  ARIA  ·  Chief Marketing Officer  ·  📣 Marketing
```

---

## CHANGE 11 — AUTONOMOUS MODE

Add a toggle for fully autonomous operation.

### Where it lives
1. `/dashboard/account` → Company Settings tab → Autonomous Mode section
2. A small toggle in the top right corner of the Chat page
   (visible but unobtrusive — for quick access)

### The toggle UI
```
Operation Mode
─────────────────────────────────────────────
Manual                          Autonomous
You brief the team.             Team runs itself.
Full control.                   Daily digest to you.

[  Manual  ] ←──────────────→ [  Autonomous  ]
```

### Manual mode (default)
- User briefs agents through Chat
- All agent actions require user approval
- Nothing executes without human sign-off

### Autonomous mode
A coordination agent (Atlas) activates and manages the executive team.

**Every Monday 9am UTC (Inngest cron):**
Atlas briefs all 5 department heads for the week based on company goals.

**Daily at 6pm UTC (Inngest cron):**
Atlas compiles a digest of everything that happened today and posts
it as a system message in the Chat page.

**Daily digest format in Chat:**
```
⬡  ATLAS  ·  Daily Update

Your team worked on [N] tasks today.

📣 Aria — 3 LinkedIn posts drafted (pending your review)
💼 Rex — 8 new leads found (pending your review)
🤝 Purity — 2 support tickets resolved
🔍 Roman — Weekly competitor brief ready
🛡️ Ghost — Codebase scanned · 0 issues found

[Review pending items →]
```

**Safety rule — NEVER executes without human approval:**
Even in Autonomous mode these actions ALWAYS require explicit approval:
- Publishing to any social platform
- Sending emails or messages externally
- Any payment or billing action
- Code deployment or GitHub PR creation

### Database change
```sql
alter table public.organizations
  add column if not exists autonomous_mode boolean default false;
```

### Atlas agent in DB
```sql
insert into public.agents (
  dept, name, emoji, role, csuite_title, is_department_head
) values (
  'system',
  'Atlas',
  '⬡',
  'Coordinates the full executive team autonomously when Autonomous Mode is active. Briefs all department heads weekly and delivers daily digests.',
  null,
  false
) on conflict do nothing;
```

### Inngest functions to add
```typescript
// Add to lib/inngest/functions/autonomous.ts

// Monday 9am — brief all departments
export const weeklyAutonomousBriefing = inngest.createFunction(
  { id: 'weekly-autonomous-briefing' },
  { cron: '0 9 * * 1' },
  async ({ step }) => {
    const orgs = await getAutonomousOrgs()
    for (const org of orgs) {
      await step.run(`brief-${org.id}`, () => generateAtlasBriefing(org))
    }
  }
)

// Daily 6pm — digest
export const dailyDigest = inngest.createFunction(
  { id: 'daily-digest' },
  { cron: '0 18 * * *' },
  async ({ step }) => {
    const orgs = await getAutonomousOrgs()
    for (const org of orgs) {
      await step.run(`digest-${org.id}`, () => generateDailyDigest(org))
    }
  }
)
```

### Plan gate
Autonomous mode is a Pro feature only.
```typescript
// PlanGate wrap the toggle:
<PlanGate requiredPlan="pro" feature="autonomous_mode">
  <AutonomousModeToggle />
</PlanGate>
```

---

## CHANGE 12 — FINAL SIDEBAR STRUCTURE

This is the definitive sidebar. Build it exactly in this order.

```
SIDEBAR
Width: collapsed = 56px | expanded = 240px

─────────────────────────────────
  ⬡  ORCA                 [›/‹]    ← logo + collapse toggle
─────────────────────────────────
  💬  Chat                          ← default landing page
  🏪  OrcaHub                       ← Templates + Integrations
  📁  Projects                      ← Multi-company
  👥  Teams                         ← Team members
  ⭐  Upgrade                       ← Pricing
  🔍  Review                        ← Approval queue
─────────────────────────────────
  RECENT                            ← section label (hidden collapsed)
  Write 5 LinkedIn posts...
  Find leads in SaaS space
  Scan codebase for issues
  Weekly intel brief
  + 4 more...
─────────────────────────────────
  [KF]  Kale Francis  ▾             ← user profile (always visible)
─────────────────────────────────
```

**Items REMOVED from sidebar:**
- Departments ← removed
- Integrations ← removed
- Account ← removed

**Active state styling:**
- Active item: text color #00FF87, subtle left border 2px #00FF87
- Background: rgba(0, 255, 135, 0.08)

**Hover state:**
- Background: rgba(0, 255, 135, 0.04)

**Collapsed state:**
- Show icons only — no labels, no recents, no user name
- User avatar still shows (just the circle, no name)
- Tooltip on hover shows the item name

---

## SEARCH GUIDE — IF SOMETHING IS NOT WHERE EXPECTED

| If you cannot find | Search for these terms | Then |
|-------------------|----------------------|------|
| Overview page | `overview`, `Overview`, `CommandCenter`, `command-center`, `command_center` | Rename to `chat` / `Chat` |
| Overview stats cards | stat card components on overview page | Delete — not on Chat page |
| Departments sidebar item | `Departments` in nav/sidebar | Remove from nav only |
| Integrations sidebar item | `Integrations` in nav/sidebar | Remove from nav only |
| Account sidebar item | `Account` in nav/sidebar | Remove from nav only |
| GOVERNANCE PROTOCOL heading | `GOVERNANCE`, `governance` | This was the old Review heading — already updated in frontend_updates.md, verify it is gone |
| Personnel section label | `PERSONNEL` | Rename to match department context e.g. `YOUR TEAM` |
| Any reference to 9 departments | `9 departments`, `45 agents` in UI copy | Replace with `5 departments`, `25 agents` |
| Any reference to old pricing | `$99`, `$199`, `$399` in UI copy | Replace with `$0`, `$29`, `$59` |

---

## PAGES THAT DO NOT CHANGE

These remain exactly as they are. Do not modify unless stated above.

- `/dashboard/department/[key]` — all 5 department workspaces
- `/dashboard/account` — all settings tabs
- `/api/*` — no changes to any API routes
- All agent workspace components inside departments
- The coordination feed component
- The approval flow

---

## RECOMMENDATIONS — IMPLEMENT THESE TOO

**1. Keyboard shortcut**
Press `/` anywhere in the dashboard to instantly focus the Chat input.
Makes the product feel fast and keyboard-native.

**2. Agent response quick actions**
Every agent response in Chat shows these buttons on hover:
```
[📋 Copy]  [✓ Approve]  [↩ Retry]  [✗ Dismiss]
```

**3. Department context pill in Chat thread**
When a conversation involves a specific department, show a pill at top:
```
💬 Chat  ›  📣 Marketing  ›  Aria (CMO)
```

**4. Typing indicator**
Show 3 pulsing dots while agent is generating a response.
Identical to any modern chat app. Reduces perceived wait time.

**5. Atlas welcome message (first login)**
When a new user completes onboarding, Atlas sends the first Chat message:
```
⬡ ATLAS

Welcome to ORCA, [First name].

Your executive team is ready:

🎙️ Aria — Chief Marketing Officer
💼 Rex — Chief Sales Officer
🤝 Purity — Chief Customer Officer
🔍 Roman — Chief Intelligence Officer
🛡️ Ghost — Chief Technology Officer

Type anything below to get started,
or click a department above to brief them directly.
```

**6. Pin conversations**
Right-click on any sidebar recent → Pin.
Pinned conversations show at the top of recents with a 📌 icon.
Maximum 3 pinned conversations.

**7. Projects empty state**
When user only has 1 company in Projects:
```
Running multiple ideas at once?

Add another company. Switch contexts instantly.
Each company gets its own executive team.

Builder — up to 3 companies
Pro — unlimited

[+ Add another company]    [Upgrade →]
```

---

## TESTING CHECKLIST — DO NOT DEPLOY UNTIL ALL PASS

### Chat page
- [ ] `/dashboard` redirects to `/dashboard/chat`
- [ ] `/dashboard/overview` redirects to `/dashboard/chat`
- [ ] New user sees: greeting + 5 dept pills + input bar + disclaimer
- [ ] Greeting changes based on time of day
- [ ] Typing a brief → routes to correct department agent
- [ ] Agent response shows: name, csuite_title, department badge
- [ ] Approve / Retry / Dismiss buttons appear on response
- [ ] After first message: greeting and pills disappear
- [ ] Conversation saves to DB → appears in sidebar recents

### Sidebar
- [ ] Departments NOT in sidebar nav
- [ ] Integrations NOT in sidebar nav
- [ ] Account NOT in sidebar nav
- [ ] Chat, OrcaHub, Projects, Teams, Upgrade, Review in sidebar (in that order)
- [ ] Recents section shows below nav items
- [ ] Clicking a recent opens that conversation in Chat
- [ ] Sidebar collapses to 56px icons only
- [ ] Sidebar expands to 240px with labels and recents
- [ ] Collapse state persists after page reload (localStorage)

### User profile avatar
- [ ] Avatar at bottom of sidebar (initials or photo)
- [ ] Clicking opens popup menu
- [ ] Popup has: Account Settings, Billing, AI Models, Security, Log out
- [ ] Log out signs out and redirects to `/`
- [ ] Collapsed sidebar shows avatar circle only

### OrcaHub
- [ ] Two tabs: Templates and Integrations
- [ ] Templates tab shows 6 templates with install buttons
- [ ] Integrations tab shows all OAuth and API key integrations
- [ ] `/dashboard/integrations` redirects to `/dashboard/orcahub?tab=integrations`
- [ ] Tab selection persists on reload via URL param

### Projects
- [ ] Projects page shows current active company
- [ ] Company switcher dropdown in top bar shows current company
- [ ] Add company modal opens with name + industry + template fields
- [ ] Creating a company creates new org and seeds it correctly
- [ ] Plan limit enforced: Free=1, Builder=3, Pro=unlimited
- [ ] Switching company reloads dashboard in new org context
- [ ] Company name in top bar updates after switch

### Executive titles
- [ ] Aria shows "Chief Marketing Officer" on agent card
- [ ] Rex shows "Chief Sales Officer"
- [ ] Purity shows "Chief Customer Officer"
- [ ] Roman shows "Chief Intelligence Officer"
- [ ] Ghost shows "Chief Technology Officer"
- [ ] Chat placeholder says "Message your Chief Marketing Officer..."
- [ ] Onboarding completion shows all 5 executive titles

### Autonomous mode
- [ ] Toggle in Account → Company Settings
- [ ] Toggle also visible in Chat page top right
- [ ] Toggling ON sets `autonomous_mode=true` in DB
- [ ] Inngest Monday briefing fires for autonomous orgs
- [ ] Daily digest appears as system message in Chat
- [ ] Publishing/sending/deploying still requires approval in autonomous mode
- [ ] Autonomous mode is Pro-only (PlanGate blocks it on Free/Builder)

### Upgrade page
- [ ] Shows Free $0 / Builder $29 / Pro $59
- [ ] Annual toggle: Builder $24/mo, Pro $49/mo
- [ ] Founding member banner visible
- [ ] Paystack checkout uses correct plan codes

---

*Nexonic Industries · orca-sigma.vercel.app · Change document — March 2026*