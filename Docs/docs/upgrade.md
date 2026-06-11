# ORCA — Full Frontend Upgrade Specification
## upgrade.md · Nexonic Industries · AI Company OS
### For Antigravity / Next.js 14 frontend folder

---

## 1. DESIGN SYSTEM OVERHAUL — COLOR LIMITING

The current build uses green on everything — borders, cards, buttons, text, backgrounds. This overwhelms the hierarchy and makes nothing feel important. Green must be earned.

### New Color Token System

```css
:root {
  /* Backgrounds */
  --bg:           #030a06;      /* page background */
  --surface:      #070d08;      /* topbar, sidebar */
  --card:         rgba(255,255,255,0.03);   /* card bg — neutral dark, NOT green-tinted */
  --card-hover:   rgba(255,255,255,0.055);  /* card hover state */
  --overlay:      rgba(0,0,0,0.75);         /* modal overlay */

  /* Borders */
  --border:       rgba(255,255,255,0.07);   /* default border — white, not green */
  --border-hover: rgba(255,255,255,0.13);   /* hover border */
  --border-active:rgba(0,255,135,0.35);     /* active/selected — GREEN only here */

  /* Text */
  --text:         #FFFFFF;      /* primary text — pure white */
  --text-body:    #E8E8E8;      /* body text */
  --text-muted:   #6b7280;      /* muted — pure grey, not green-grey */
  --text-faint:   #374151;      /* very faint labels */

  /* Green — reserved for life, action, success */
  --green:        #00FF87;      /* primary accent */
  --green-mid:    #00C96B;      /* gradient end */
  --green-dim:    rgba(0,255,135,0.10);  /* green tint bg — sparingly */
  --green-border: rgba(0,255,135,0.25); /* green border — active states only */

  /* Semantic */
  --warn:         #FFB800;
  --warn-dim:     rgba(255,184,0,0.10);
  --danger:       #FF5050;
  --danger-dim:   rgba(255,80,80,0.10);
  --blue:         #00c8ff;
  --blue-dim:     rgba(0,200,255,0.10);
}
```

### Where Green Is Allowed (exhaustive list — nothing else)
- ORCA logo wordmark
- Primary CTA button (one per view/section)
- Active nav item: left border + text color only
- Agent status dot: active = green (busy = yellow, idle = white at 20%)
- Selected agent pill: border + avatar tint + acronym text
- Coordination feed live events: agent name color
- Approval / success state badges
- The single most important stat number per card (one per card max)
- Progress bar fills
- The pulsing dot on "Overview" tab in topbar
- "● Active" status label on agent hero

### Where Green Is NOT Allowed (switch to white/grey)
- Default card borders → `var(--border)`
- Default button borders → `var(--border)`
- Secondary buttons → white border, white text
- Default agent pill borders → `var(--border)`
- Default agent pill avatar backgrounds → `rgba(255,255,255,0.06)`
- Input box borders → `var(--border)`, focus = `rgba(255,255,255,0.2)`
- Sidebar nav default text → `var(--text-muted)`
- Sidebar nav hover → white text, `rgba(255,255,255,0.04)` bg
- Stat card values (non-primary) → `var(--text)`
- Section headers → `var(--text)`
- Dividers / separators → `rgba(255,255,255,0.06)`
- Badge backgrounds (non-success) → `rgba(255,255,255,0.06)`
- Dept label text above agent pills → `var(--text-muted)`

---

## 2. BUTTON STATES — ALL INTERACTIVE ELEMENTS

Every clickable element must have distinct default, hover, active (pressed), focus, and disabled states. Currently buttons have no feedback on click.

### Primary Button (green — one per major section)
```css
.btn-primary {
  background: var(--green);
  color: #030a06;
  border: none;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  padding: 8px 18px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-primary:hover {
  background: var(--green-mid);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0,255,135,0.25);
}
.btn-primary:active {
  background: #00a855;
  transform: translateY(0px) scale(0.98);
  box-shadow: none;
}
.btn-primary:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 3px;
}
.btn-primary:disabled {
  background: rgba(0,255,135,0.15);
  color: rgba(0,255,135,0.3);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

### Secondary Button (white border)
```css
.btn-secondary {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
  font-family: 'DM Mono', monospace;
  font-size: 11.5px;
  padding: 7px 14px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-secondary:hover {
  border-color: var(--border-hover);
  color: var(--text);
  background: rgba(255,255,255,0.04);
}
.btn-secondary:active {
  background: rgba(255,255,255,0.07);
  transform: scale(0.98);
}
.btn-secondary:focus-visible {
  outline: 2px solid rgba(255,255,255,0.3);
  outline-offset: 3px;
}
```

### Danger Button
```css
.btn-danger {
  background: transparent;
  color: #ff7070;
  border: 1px solid rgba(255,80,80,0.2);
  transition: all 0.15s ease;
}
.btn-danger:hover {
  background: var(--danger-dim);
  border-color: rgba(255,80,80,0.4);
  color: var(--danger);
}
.btn-danger:active {
  transform: scale(0.98);
}
```

### Nav Items / Sidebar Links
```css
.nav-item {
  color: var(--text-muted);
  transition: all 0.15s ease;
  border-left: 2px solid transparent;
}
.nav-item:hover {
  color: var(--text-body);
  background: rgba(255,255,255,0.04);
}
.nav-item:active {
  background: rgba(255,255,255,0.07);
}
.nav-item.active {
  color: var(--green);
  background: rgba(0,255,135,0.07);
  border-left-color: var(--green);
}
```

### Agent Pills
```css
.agent-pill {
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.02);
  transition: all 0.15s ease;
}
.agent-pill:hover {
  border-color: var(--border-hover);
  background: rgba(255,255,255,0.05);
}
.agent-pill:active {
  transform: scale(0.97);
}
.agent-pill.selected {
  border-color: var(--green-border);
  background: rgba(0,255,135,0.07);
}
```

### Cards (clickable)
```css
.card-clickable {
  border: 1px solid var(--border);
  background: var(--card);
  transition: all 0.2s ease;
  cursor: pointer;
}
.card-clickable:hover {
  border-color: var(--border-hover);
  background: var(--card-hover);
  transform: translateY(-2px);
}
.card-clickable:active {
  transform: translateY(0px);
  background: rgba(255,255,255,0.06);
}
```

### Input / Textarea
```css
.input {
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.03);
  color: var(--text);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.input:hover {
  border-color: var(--border-hover);
}
.input:focus {
  border-color: rgba(255,255,255,0.25);
  box-shadow: 0 0 0 3px rgba(255,255,255,0.04);
  outline: none;
}
```

### Toggle / Switch
```css
.toggle {
  background: rgba(255,255,255,0.1);
  transition: background 0.2s ease;
}
.toggle.on {
  background: var(--green);
}
.toggle:active {
  transform: scale(0.95);
}
```

---

## 3. LANDING PAGE — FULL CONTENT SPECIFICATION

Route: `/` (public)

### 3.1 — Navbar
Fixed top. `background: rgba(3,10,6,0.85)` + `backdrop-filter: blur(20px)`.
Left: ORCA logo (Syne 800, green). Center: nav links. Right: CTA.

Nav links: Features · Departments · Pricing · About · Nexonic
CTA button: "Join Early Access →" (primary green)

Mobile: hamburger menu, full-screen overlay nav.

Scroll behavior: border-bottom appears after 60px scroll (`rgba(255,255,255,0.06)`).

---

### 3.2 — Hero Section

Full viewport height. Centered content. Subtle animated background: slow-moving radial green gradient at 3% opacity, like bioluminescence deep underwater.

**Eyebrow tag:**
`⬡ AI Company OS — Now in Early Access`
Small pill: `border: 1px solid rgba(255,255,255,0.1)`, white text 11px, subtle bg.

**Headline (Syne 800, large — 56–72px desktop, 36px mobile):**
```
You're the CEO, CMO,
CTO, and COO.
Not anymore.
```
Line 1–2: `color: #FFFFFF`
Line 3 "Not anymore.": `color: var(--green)` — the only green text in the hero

**Subheadline (DM Mono, 15px, muted):**
```
ORCA is your AI Company OS — 36 agents across 9 departments,
coordinated and working. Built for founders who can't afford to wait.
```

**CTA row:**
- Primary: "Join the Waitlist →" (green button, large)
- Secondary: "See how it works ↓" (white border button)
- Below buttons: `🔒 Free to join · No credit card · Early access pricing locked in`
  (DM Mono 11px muted)

**Social proof strip below CTA:**
`[★★★★★]  Trusted by 200+ founders on the waitlist`
Small, muted, centered. Builds before launch credibility.

**Hero visual:**
Dashboard mockup — cropped screenshot or illustrated version of the ORCA Command Center. Floating, slight perspective tilt (CSS `perspective` transform). Green glow underneath it like it's hovering. Animate in on load: `fadeUp 0.8s ease both`.

---

### 3.3 — Problem Section

Background: slightly lighter than hero — `#040d06`.
Centered. Max-width 800px.

**Heading (Syne 700, 36px):**
```
You're running a company
with a person-shaped hole where a team should be.
```

**Body (DM Mono 14px, muted, line-height 1.9):**
```
Most founders are paying for 8–12 disconnected tools — Notion, HubSpot,
Buffer, GitHub, QuickBooks, Zendesk — and manually bridging every single
one of them every day. You're the marketer, the salesperson, the support
agent, the finance tracker, and the product builder. All at once.

Hiring fixes this. But a full team across Marketing, Sales, Ops, Hiring,
Finance, and Tech costs $300K–$600K per year. That's not an option.

So you stay the bottleneck. Until now.
```

**Tool sprawl visual:**
Grid of 12 tool logos (Notion, HubSpot, Buffer, GitHub, QuickBooks, Zendesk, Slack, Mailchimp, Linear, Stripe, Ahrefs, Zoom) connected by dashed lines — all disconnected and chaotic. Animate in as scattered, then a large ✕ appears over them.

---

### 3.4 — Solution Section

Dark bg. Full width.

**Heading:**
```
One dashboard.
Your entire company.
```
"Your entire company." in green.

**3-column value props:**

| Icon | Title | Body |
|------|-------|------|
| ⬡ | 36 AI Agents | Every function covered. Marketing, Sales, Hiring, Finance, Tech, Ops, Support, Intelligence, Community. |
| ⇄ | Coordinated | Agents hand off work to each other across departments. No manual bridging. No Slack threads. |
| 👁 | You stay in control | Nothing high-stakes happens without your approval. Autopilot, Approve First, or Suggest Only — your call. |

Each prop: white icon (not green), white title, grey body. Clean.

---

### 3.5 — Departments Section

**Heading:** "9 departments. Fully staffed."

3×3 grid of dept cards. Each card:
- Dept emoji + name (Syne 700)
- Agent count ("5 agents")
- 2–3 agent acronym pills shown (e.g. AR · NV · PX)
- One-line description of what this dept does for their company
- `border: 1px solid var(--border)`, hover brightens border (white, not green)
- Only the HOVERED card gets a faint green border tint

Department cards content:

**📣 Marketing** — 5 agents (AR · NV · PX · EC · TN)
"Content, social, SEO, ads, and brand voice — all running without a marketing hire."

**💼 Sales & Revenue** — 5 agents (RX · PL · CL · CH · LN)
"Lead prospecting, outreach, CRM management, follow-ups, and deal intelligence."

**🤝 Customer Success** — 4 agents (HB · GD · AN · FB)
"Support tickets, onboarding, retention, and NPS — handled before customers churn."

**🛡️ Tech & Security** — 4 agents (SH · GH · DP · SC)
"Code scanning, PR reviews, deployments, docs — with CyberGuard built in."

**🧠 People & Hiring** — 4 agents (SK · VR · TR · WL)
"Sourcing, screening, verification, and offer coordination — without a recruiter."

**📋 Operations** — 4 agents (AT · SD · MM · FL)
"Project management, calendar, meeting notes, and inbox — all handled."

**📊 Finance & Legal** — 4 agents (LD · BL · CZ · CP)
"Expenses, invoicing, contracts, and budget forecasting — no accountant needed."

**🔍 Intelligence & Research** — 4 agents (OR · SG · BR · FS)
"Competitor research, market signals, weekly briefs, and forecasting."

**🌐 Community & Growth** — 4 agents (VB · BG · RC · SP)
"Community management, partnerships, influencer outreach, and growth experiments."

---

### 3.6 — How It Works Section

**Heading:** "How ORCA works"
**Subheading:** "From brief to execution in seconds."

4-step horizontal flow (desktop) / vertical (mobile):

**Step 1 — Brief an agent**
You type: "Write 3 LinkedIn posts about our product launch. Founder tone."
→ Aria receives the brief

**Step 2 — Agent executes**
Aria researches your brand voice, drafts 3 posts, formats for LinkedIn.
Result card appears with → Approve button.

**Step 3 — Agents coordinate**
Aria detects warm leads in the posts. She hands 47 profiles to Rex (Sales) with context attached.
`⇄ Aria → Rex — 47 warm profiles — ✓ Handoff`

**Step 4 — You stay in control**
Rex queues the outreach. Sends to your Review page for sign-off before anything goes out.
`📋 Review — Pending your approval`

Visual: animated flow diagram. Arrows animate left-to-right. Each step card lights up in sequence on scroll.

---

### 3.7 — Nexonic Ecosystem Section

**Heading:** "One subscription. Five products."
**Subheading:** "Everything in the Nexonic stack ships inside ORCA."

5 product cards in a row:

**CyberGuard** 🛡️
AI code security scanner. Finds vulnerabilities, opens fix PRs automatically.
`Available from Starter`

**Render.AI** 🎬
Neural video generation and creative production for your marketing agents.
`Available from Pro`

**Intuition** 🧠
AI-powered HR behavioral truth-scoring for hiring verification.
`Available from Pro`

**The Summit** 🏔️
Elite talent sourcing network. Your hiring agents source from here directly.
`Available from Pro`

**Island of Relevancy** 🌐
Builder community. Your growth agents tap into it for partnerships and reach.
`Available from Pro`

Each card: white border, dark bg, product icon, name (Syne 700), description, plan badge.
Plan badge: `Starter` = white/grey · `Pro` = green tint

Plus one more card at the end:
**LegacyLock** 🔐 — Secure digital asset inheritance. Standalone product.
`nexonic-industries.vercel.app`

---

### 3.8 — Pricing Section

**Heading:** "Start free. Scale when you're ready."

Billing toggle: Monthly / Annual. Annual shows "Save 2 months" badge.

4 cards horizontal:

**Free — $0/mo**
- 1 department
- 5 agents
- 100 tasks/mo
- 1 team member
- Community support
CTA: "Get Started Free"

**Starter — $99/mo**
- 3 departments
- 15 agents
- Unlimited tasks
- 3 team members · 1 Dept Head
- CyberGuard included
- Email support
CTA: "Start Starter"

**Pro — $199/mo** ⭐ MOST POPULAR
- All 9 departments
- All 36 agents
- Unlimited tasks
- 10 team members · 3 Dept Heads
- CyberGuard + Render.AI + Intuition + The Summit + Island of Relevancy
- Priority support
CTA: "Start Pro" (green filled button)
Card: `border-color: rgba(0,255,135,0.35)` + subtle green glow + `scale(1.02)`

**Enterprise — $399/mo**
- All 9 departments
- 36 agents + custom agents
- Unlimited tasks + team members
- Full Nexonic stack + API access
- Dedicated support + custom onboarding
CTA: "Contact Us"

Feature comparison table below cards (collapsible on mobile).

---

### 3.9 — Onboarding Preview Section

**Heading:** "You're 5 steps away from a full AI workforce."

Horizontal step flow:

1. **Brief your workforce** *(45 sec)* — Name, company, brand voice, ICP
2. **Build your org chart** *(1 min)* — Pick departments, see which agents join
3. **Set operating mode** *(1 min)* — Autopilot / Approve First / Suggest Only
4. **Connect your stack** *(1–2 min)* — Only shows integrations for your chosen depts
5. **Give your first order** *(1 min)* — Brief your first agent, watch it work

Each step: number circle (white border, not green) + title + time. Active step = green circle. This mirrors the actual onboarding flow inside the app.

---

### 3.10 — Who It's For Section

**Heading:** "Built for founders who wear every hat."

4 persona cards:

**Solo Founder**
"You're running Marketing, Sales, Ops, Finance, and Tech alone. ORCA is your entire team."

**Co-Founders (2–5 people)**
"You're moving fast but stretched thin. ORCA fills every gap between your human team."

**Indie Hacker**
"You ship fast and stay lean. ORCA handles every non-product task so you stay in flow."

**Early Stage Startup (6–15 people)**
"You have people but no systems. ORCA gives your team AI agents to multiply their output."

Each card: white border, avatar icon, title (Syne 700), body (DM Mono muted).
Hover: border brightens (white, not green).

---

### 3.11 — Testimonials / Social Proof Section

**Heading:** "What founders are saying"

3 quote cards. Placeholder content until real testimonials collected:

> "I replaced 4 tool subscriptions and 2 planned hires with ORCA in week one."
> — Early access founder, SaaS · 3 people

> "The coordination between agents is what got me. Aria hands off to Rex automatically. I just approve."
> — Indie hacker, E-commerce · Solo

> "Finally something that thinks like a company, not a feature."
> — Co-founder, Fintech · 8 people

Card style: `border: 1px solid var(--border)`, dark bg, quote in white, attribution in muted. Stars in yellow (not green).

---

### 3.12 — CTA Section (Final)

Full-width dark section. Centered. Max-width 700px.

**Heading (Syne 800, 48px):**
```
Your competitors have teams.
You have ORCA.
```

**Body:**
"Join the early access waitlist. Lock in founding member pricing. Shape how ORCA gets built."

**CTA:**
Big green button: "Join the Waitlist → tally.so/r/D41bB5"
Below: "Free to join · No credit card · 200+ founders already in"

---

### 3.13 — Footer

4-column layout:

**Col 1 — Brand**
ORCA logo (green) + "AI Company OS by Nexonic Industries"
Tagline: "Your AI workforce. One dashboard."
Social links: LinkedIn icon → linkedin.com/in/nexonic-industries

**Col 2 — Product**
Features · Departments · Pricing · Onboarding · Dashboard · Integrations

**Col 3 — Nexonic**
About Nexonic · CyberGuard · Render.AI · Intuition · The Summit · LegacyLock · Island of Relevancy · Lunar AI (Coming Soon)

**Col 4 — Company**
About · Contact · Privacy Policy · Terms of Service · Cookie Policy

Bottom bar: `© 2025 Nexonic Industries. All rights reserved.` · Privacy · Terms

---

## 4. DASHBOARD — MISSING PAGES & FIXES

### 4.1 — Pages That Must Be Fully Built

All pages listed in the dashboard spec must be complete and navigable:

| Page | Route | Status needed |
|------|-------|---------------|
| Command Center | `/dashboard` | Complete — stat cards, dept grid, coord feed, activity feed all populated |
| Dept Workspace | `/dashboard/dept/[key]` | All 9 depts navigable, all 36 agent pills working, agent hero on pill select, message thread functional |
| Review | `/dashboard/review` | Approval queue, dept reports grid, coord log all populated |
| Teams | `/dashboard/team` | Member grid, dept heads grid, invite modal functional |
| Integrations | `/dashboard/integrations` | All 9 dept sections with all integrations listed |
| Upgrade | `/dashboard/upgrade` | Pricing cards, billing toggle, feature table, ecosystem section |
| Account — Owner | `/dashboard/account` | All 7 tabs fully built |
| Account — Head/Member | `/dashboard/account` | 3-tab minimal version |
| Member Overview | `/dashboard/my` | 3 tabs: Overview, Agents, Team Chat |
| Onboarding | `/onboarding` | 5-step flow fully built |

---

### 4.2 — Dashboard Sidebar (Both Versions)

**Owner sidebar — exact order:**
```
ORCA     [CEO badge]     [◀]
─────────────────────────────
⬡  Overview
🏢  Departments  ▾
    📣 Marketing
    💼 Sales & Revenue
    🤝 Customer Success
    🛡️ Tech & Security
    🧠 People & Hiring
    📋 Operations
    📊 Finance & Legal
    🔍 Intelligence
    🌐 Community & Growth
📋  Review          [badge]
👥  Teams
🔗  Integrations
─────────────────────────────
👤  Account
⚡  Upgrade
↩   Logout
─────────────────────────────
[avatar]  Name
          Role · Plan
```

**Member/Head sidebar — exact order:**
```
ORCA     [MEMBER badge]  [◀]
─────────────────────────────
[dept icon] Dept Name
            Your department
─────────────────────────────
⬡  Overview
🤖  Agents
💬  Team Chat     [badge]
─────────────────────────────
[Head card — Members only]
─────────────────────────────
🔗  Integrations
─────────────────────────────
👤  Account
↩   Logout
─────────────────────────────
[avatar]  Name
          Dept · Role
```

---

### 4.3 — Command Center (Overview Page)

Must include all of the following, fully populated:

**Greeting:** "Good morning, [Name]. Your workforce is active. 🟢"

**4 stat cards:**
- Tasks Today: 47 · ↑ +12 from yesterday
- Active Agents: 9 · Across 3 departments
- Pipeline Leads: 124 · ↑ Rex added 18
- Coord. Events: 31 · Last: Shield → Atlas

Stat card values: `var(--text)` white — NOT green. Only one value per card can be green (the most important one, and only on the card where it makes sense contextually).

**Department Status grid (3×3):**
Each cell: emoji + dept name + ACTIVE/IDLE badge + agent action + progress bar.
Cards use `var(--border)` white borders. Hover = `var(--border-hover)`. NO default green borders.

**Coordination Feed (right column):**
- Aria → Rex | HANDOFF | 47 warm profiles | ✓ Done
- Shield → Atlas | ALERT | Critical vuln — PR #47 | ✓ Done
- Clara → Harbor | TRIGGER | Deal closed $299/mo | ✓ Sent
- Oracle → Nova | BRIEF | Competitor content brief | ⏳ Active

**Live Activity Feed (full width):**
- Shield: Scanned repo · PR #47 opened · 2m · Tech & Sec
- Aria: LinkedIn post published · 284 impressions · 8m · Marketing
- Rex: 14 AI-signal leads added · 15m · Sales
- Scout: 6 Senior Engineers sourced · 31m · Hiring

---

### 4.4 — Department Workspace

**Agent pills:** Acronym only. All 9 depts must load their correct agents.

Each dept's agents:
- Marketing: AR · NV · PX · EC · TN
- Sales: RX · PL · CL · CH · LN
- Customer Success: HB · GD · AN · FB
- Tech: SH · GH · DP · SC
- Hiring: SK · VR · TR · WL
- Operations: AT · SD · MM · FL
- Finance: LD · BL · CZ · CP
- Intelligence: OR · SG · BR · FS
- Community: VB · BG · RC · SP

**Agent hero on pill select (required fields):**
- 58px avatar with acronym
- Full name (Syne 800 20px)
- Role description
- Status dot + label + task count today + last action (italic)
- Memory · History · ▶ Run Task buttons
- Horizontal divider
- Message thread below (empty state until first message)

**Input zone (required):**
- Dept label (centered, uppercase, muted)
- Pills row (fused top of input box)
- Quick prompts row (5 per agent, hidden until pill selected)
- Textarea + send button
- Enter = send · Shift+Enter = newline

**Message thread (required):**
- User bubble: right, `rgba(255,255,255,0.07)` bg, white border
- Agent bubble: left, `rgba(255,255,255,0.04)` bg, white border
- Thinking dots animation while processing
- Result card with Approve button
- Inline coordination events when cross-dept handoff occurs

---

### 4.5 — Review Page

**Stat cards (4):**
- Pending Approvals: 5 (yellow)
- Coord Events Today: 31 (white)
- Dept Reports: 2 of 9 (white)
- Team Online: 3 (white — not green for a count)

**Approval queue items (4 demo items):**

1. 🛡️ RED border — Shield hotfix PR #47. No Tech Head → CEO required.
   Chain: `[Shield] → no head · CEO required → [Deploy]`
   Buttons: ✓ Approve Deploy · View PR · ✕ Reject

2. 💼 YELLOW border — Rex enterprise outreach 47 leads. James K. approved → CEO threshold.
   Chain: `[Rex] → [James K. ✓] → CEO review`
   Buttons: ✓ Approve · Preview · ✕ Reject

3. 📣 WHITE/GREEN border — Amara M. Marketing weekly report.
   Chain: `[Amara M.] → CEO report`
   Buttons: ✓ Acknowledge · Full Report

4. 🧠 WHITE border — Scout 6 engineers. No Hiring Head → CEO.
   Chain: `[Vera] → no head → CEO`
   Buttons: ✓ Proceed · View Candidates · Hold

Approving: item opacity → 40%, buttons hide, "✓ Approved — agents executing" fades in. Badge count decrements.

**Dept reports grid (3 cols):**
- 📣 Marketing — Amara M. — Tasks: 12, Leads: 3, Posts: 8 — NEW badge
- 💼 Sales — James K. — Leads: 42, Deals: 3 — NEW badge
- 🛡️ Tech — No head assigned — greyed out, red label

**Coordination log:**
- Aria → Rex | HANDOFF | 2m | ✓ Amara M. + James K. approved
- Shield → CEO | ALERT | 8m | ⏳ CEO pending
- Clara → Harbor | TRIGGER | 15m | ✓ Auto-approved

---

### 4.6 — Teams Page

**Member grid (3 cols, 6 cards):**

1. Kale Francis — CEO · Owner — green avatar — All depts — Reviews: 5 — ● Online
2. Co-founder slot — dashed blue border — "Invite pending" — description of access
3. Amara M. — Head · Marketing — yellow avatar — Approved: 12, Pending: 3 — ● Online
4. James K. — Head · Sales — yellow avatar — Leads: 42 — ● Away
5. Sara N. — Member · Marketing — muted avatar — Briefed: 7 — ● Online
6. + Invite card — dashed white border — ＋ icon

**Dept Heads grid (3 cols, 9 cells):**
- Marketing: Amara M. ● Active
- Sales: James K. ● Away
- Tech: + Assign Head (dashed, "Escalates to CEO")
- Hiring: + Assign Head
- Operations: + Assign Head
- Finance: + Assign Head
- Customer Success: + Assign Head
- Intelligence: + Assign Head
- Community: + Assign Head

**Invite modal — full fields:**
- Email input
- Role selector (4 cards — Head / Member / Co-founder / Advisor)
- Department dropdown (9 options)
- Permission preview (updates dynamically per role)
- Cancel + Send Invite

---

### 4.7 — Integrations Page

All 9 dept sections. Each section has a header with dept icon + name. Cards in 3–4 col grid.

Full integration list per dept (as specified in Dashboard prompt). Each card:
- Emoji + name
- Connected: green dot + "Connected" + Disconnect button
- Disconnected: muted dot + "Not connected" + Connect button
- Connect opens OAuth modal or API key input

---

### 4.8 — Upgrade / Pricing Page

Billing toggle (Monthly / Annual). Annual: prices update, "Save 2 months" badge appears.

4 cards:
- Free: $0 · 1 dept · 5 agents · 100 tasks · "Get Started Free"
- Starter: $99 · 3 depts · 15 agents · CyberGuard · "Start Starter"
- Pro ⭐: $199 · All 9 · All 36 · Full Nexonic stack · "Start Pro" (green filled)
- Enterprise: $399 · All 9 + custom · API · Dedicated support · "Contact Us"

Feature comparison table. Nexonic ecosystem section below.

---

### 4.9 — Account Settings (Owner — 7 tabs)

**Tab 1 — Profile:**
Avatar upload · Name · Email + Verified badge · Job title · Timezone · Language · Save

**Tab 2 — Company:**
Company name · Industry dropdown · Stage dropdown · Mission textarea · Brand voice dropdown · ICP textarea · Geography · Competitors (comma-separated) · Logo upload · Brand colors (hex inputs) · Upload brand docs (PDF) · Connect Notion/Drive · Import CRM · Save

**Tab 3 — Agent Permissions:**
Per-dept toggle: Autopilot / Approve First / Suggest Only
Grid of 9 rows, one per department.
Master kill switch: "Pause all agents" (red toggle when on).

**Tab 4 — Integrations shortcut:**
Summary cards showing connected count per dept → link to full integrations page.

**Tab 5 — Billing:**
Current plan + renewal date + seats used.
"Upgrade Plan" button.
Payment method (last 4 + expiry + Update card).
Billing history table (date · desc · amount · status · Download).
Cancel subscription (danger, small, bottom).

**Tab 6 — Notifications:**
Toggle per event type. Delivery: In-app / Email / Both.
Events: task completions, coord events, approval requests, dept reports, member joined, invite accepted, billing alerts.

**Tab 7 — Security:**
Change password. 2FA toggle. Active sessions (device + location + Revoke). Sign out all devices. Delete Organisation (danger zone, collapsible, requires typing org name to confirm).

---

### 4.10 — Account Settings (Head / Member — 3 tabs)

**Tab 1 — Profile:**
Avatar · Name · Email (read-only, "Managed by [Org]") · Department badge (read-only) · Timezone · Save

**Tab 2 — Notifications:**
Scoped toggles (only their dept events + messages from Head/CEO).

**Tab 3 — Security:**
Change password · 2FA · Active sessions · Sign out all devices.
No org deletion option.

---

### 4.11 — Member Dashboard (Head / Member)

**3 tabs: Overview · Agents · Team Chat**

**Overview tab:**
- Cross-dept pending banner (yellow, when applicable): "● Your Aria → Rex request is waiting on Amara M. View in Chat →"
- 3 stat cards (dept-scoped only)
- Agent activity feed (their dept only)
- Waiting on you section (tasks needing their review)

**Agents tab:**
Full agent list as expanded rows. Avatar + name + role + last action + task count + Brief button. Cross-dept note below.

**Team Chat tab:**
Head avatar + name + status in header. Message thread with head. System notifications for pending approvals. Input + send.

---

### 4.12 — Onboarding Flow (5 steps)

Route: `/onboarding`

**Step 1 — Brief your workforce:**
"Before your agents start working, they need to know who they're working for."
Fields: Your name · Company name · One-line mission · Brand voice (4 options) · Who is your customer?
Progress: Step 1 of 5

**Step 2 — Build your org chart:**
"Your company runs on 9 departments. Pick where to start."
Visual grid of all 9 depts. Pre-select based on Step 1 answers.
Each dept shows agent count + acronym pills. Plan-gate: Free = 1 dept max.
"You can unlock more from Upgrade anytime."

**Step 3 — Set operating mode:**
"How should your agents work?"
3 visual option cards: Autopilot · Approve First · Suggest Only
Description of each. One global setting to start (adjustable per-dept in Account later).

**Step 4 — Connect your stack:**
Only shows integrations for the depts selected in Step 2.
Skip button available. "Connect more from Integrations anytime."

**Step 5 — Give your first order:**
"Your team is ready. Give your first order."
Auto-selects most relevant agent for their company type.
Pre-loaded context-aware prompt suggestion.
"Your agents already know your company. This is your first brief."
Send → watch the thinking dots → result appears → dashboard animates in.

**Final reveal:**
Dashboard loads with:
- Their agents showing as Active
- Coord feed showing first handoff
- Welcome message: "Welcome to Nexonic, [Name]. Your company just got a team."

---

## 5. FOOTER PAGES — FULL CONTENT

All footer links must be real pages, not 404s.

### /privacy — Privacy Policy
- What data is collected (email, company info, usage data, agent briefs)
- How it's used (to run ORCA agents, improve the product)
- Third-party services (Supabase, Vercel, Stripe)
- Data retention policy
- User rights (delete account, export data)
- Contact: privacy@nexonic.com
- Last updated date

### /terms — Terms of Service
- Acceptance of terms
- Description of service (ORCA AI Company OS)
- User responsibilities (no misuse, no illegal use)
- Agent output disclaimer (AI-generated, user reviews before acting)
- Subscription terms (billing, cancellation, refunds)
- Intellectual property (Nexonic owns ORCA; user owns their data and agent outputs)
- Limitation of liability
- Contact: legal@nexonic.com

### /cookies — Cookie Policy
- What cookies are used (auth session, analytics, preferences)
- How to opt out
- Third-party cookies (Vercel analytics)

### /about — About Nexonic Industries
**Heading:** "We're building the operating system for the next generation of companies."

Content sections:
- The mission: "Nexonic Industries builds AI infrastructure for founders. Not tools — systems."
- The story: "Started from a simple observation: founders were drowning in tools and understaffed at the same time. ORCA was built to fix that."
- The ecosystem: 8 products, one vision (list all products with one-line descriptions)
- The team section: placeholder for team cards
- Location: Nairobi, Kenya 🇰🇪
- Contact: hello@nexonic.com
- LinkedIn: linkedin.com/in/nexonic-industries

### /contact — Contact Page
Simple form: Name · Email · Company · Message · Send button
Plus: hello@nexonic.com · LinkedIn link
Response time note: "We respond within 24 hours."

---

## 6. ADDITIONAL PAGES (Navbar)

### /features — Features Page
Deep dive on ORCA's core capabilities:
- 36 agents overview (all listed with acronym, role, dept)
- Coordination system explained with diagram
- Role hierarchy explained (Owner / Head / Member)
- Agent operating modes (Autopilot / Approve First / Suggest Only)
- Plan-gated features table
- CTA: "See it in action → Join waitlist"

### /departments — Departments Page
Full page dedicated to all 9 departments.
Each dept gets a section: icon + name + heading + 3-4 sentence description + agent cards (all agents in that dept with their role) + example use cases.

---

## 7. GLOBAL FIXES CHECKLIST

Apply these across every page and component:

- [ ] All green card/component borders → `var(--border)` (white at 7%)
- [ ] All green hover borders → `var(--border-hover)` (white at 13%)
- [ ] Green border only on: active nav, selected pill, primary CTA, success states
- [ ] All buttons: default + hover + active (pressed) + focus + disabled states defined
- [ ] All clickable cards: hover lift + active press + focus ring
- [ ] All inputs: hover border brighten + focus glow (white, not green)
- [ ] All nav items: hover bg + active state + pressed state
- [ ] Text color: body = `#E8E8E8`, muted = `#6b7280`, headings = `#FFFFFF`
- [ ] Card backgrounds: `rgba(255,255,255,0.03)` — remove green tint from all cards
- [ ] Status dots: active = green · busy = yellow · idle = `rgba(255,255,255,0.2)`
- [ ] Stat card values: white by default, green only on the primary metric per card
- [ ] Coordination feed agent names: from-agent = white, to-agent = green (this green is earned)
- [ ] All modals: white border, not green border
- [ ] Scrollbars: `rgba(255,255,255,0.08)` track, `rgba(255,255,255,0.15)` thumb
- [ ] Focus rings: white-based, not green (except primary CTA button)
- [ ] Mobile responsive: all pages responsive down to 375px
- [ ] Loading states: skeleton screens on data load (white shimmer, not green)
- [ ] Empty states: all views have proper empty state copy and illustration
- [ ] 404 page: branded, with nav back to dashboard or homepage
- [ ] Toast notifications: success = green tint · error = red tint · info = white tint

---

*Nexonic Industries · nexonic-industries.vercel.app*