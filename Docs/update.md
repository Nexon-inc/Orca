# ORCA — Frontend Updates
## frontend_updates.md · All fixes to implement in one pass
### Do all of these in a single update — deploy once when all are complete

---

## UPDATE 1 — Agent Input Textarea (All agent workspaces)

Find the textarea with placeholder "Command [Agent]..." across all 9 department workspaces and update:

```css
min-height: 52px;
max-height: 120px;
height: 52px;
resize: none;
overflow-y: auto;
```

**Behaviour:**
- Starts at one line height (52px)
- Expands automatically as user types up to 120px max
- Scrolls inside after 120px — never grows bigger
- Matches Claude/ChatGPT style modern chat input

**Quick prompt pills:**
- Move to sit directly above the textarea with exactly 8px gap
- Do NOT float in the middle of empty space
- Pills: department-specific (see Update 3 below for all pill labels)

**Message thread area:**
- The space above pills is correct — it's the conversation thread
- Remove any unnecessary top padding that pushes content down

---

## UPDATE 2 — File Upload Button (+ icon in agent workspace)

The + icon already exists. Update it to open an upload menu.

**When user clicks +, show a popup with:**
```
📎  Upload file
🖼️  Upload image  
📄  Upload document (PDF, DOCX, TXT)
```

**After file selected:**
- Show preview pill above input: `📄 filename.pdf  ✕`
- User types brief alongside the attachment
- Send button sends both text + file together

**Message payload to `/api/conversations/[id]/messages`:**
```typescript
{
  content: string,
  attachments?: {
    name: string,
    type: 'pdf' | 'docx' | 'txt' | 'image' | 'csv' | 'code',
    data: string,     // base64
    text?: string     // extracted text for non-image files
  }[]
}
```

**Backend — in the message handler, if attachments present:**
```typescript
if (attachments && attachments.length > 0) {
  for (const file of attachments) {
    if (file.type === 'image') {
      // Add as vision message for Gemini
      messages.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${file.data}` } })
    } else {
      // Append extracted text to system prompt
      systemPrompt += `\n\nATTACHED FILE — ${file.name}:\n${file.text}`
    }
  }
}
```

**File size limits (enforce on frontend before upload):**
- Images: max 5MB
- Documents: max 10MB
- Code files: max 2MB
- Show error toast if exceeded

**Accepted file types:**
- Documents: `.pdf`, `.docx`, `.txt`, `.md`
- Spreadsheets: `.csv`, `.xlsx`
- Code: `.ts`, `.js`, `.py`, `.go`, `.json`
- Images: `.png`, `.jpg`, `.jpeg`, `.webp`

**Department-specific suggested uploads (show top 3 when + is clicked):**

| Department | Suggested uploads |
|-----------|------------------|
| Marketing (Aria, Jackie, Eric, Lucy, Joe) | Brand guidelines PDF · Previous content examples · Campaign brief |
| Sales (Rex, Clara, Chase, Mark, Teo) | Lead list CSV · Product one-pager · CRM export |
| Customer Success (Purity, Bruce, Nadia, John, Beatrice) | Customer feedback CSV · Support ticket export · NPS results |
| Tech & Security (Ghost, Cipher, Wren, Hex, Volt) | Code file · Repository doc · Error logs TXT |
| People & Hiring (Marcus, Vera, Zara, Eli, Nina) | Job description · Candidate CV PDF · Interview scorecard |
| Operations (Atlas, Cal, Dean, Iris, Owen) | Project brief · Meeting notes · Process SOP |
| Finance & Legal (Bill, Felix, Lena, Reid, Cora) | Invoice PDF · Expense CSV · Contract PDF |
| Intelligence (Roman, Sage, Nate, Ada, Dex) | Research PDF · Market data CSV · Industry report |
| Community & Growth (Spike, Milo, Rio, Zoe, Kai) | Partnership proposal · Influencer list CSV · Growth brief |

---

## UPDATE 3 — Quick Prompt Pills (Per agent)

Replace generic pills with agent-specific ones. Each agent shows 3 pills above the input.

**📣 Marketing**
- Aria: `Write 5 tweets` · `Draft LinkedIn post` · `Content calendar`
- Jackie: `Write blog post` · `Email newsletter` · `Product announcement`
- Eric: `Facebook ad copy` · `Google ad variants` · `Retargeting copy`
- Lucy: `SEO audit` · `Keyword research` · `Meta descriptions`
- Joe: `Brand voice guide` · `Tagline options` · `Tone review`

**💼 Sales**
- Rex: `Find 20 leads` · `Enrich contacts` · `ICP research`
- Clara: `Update CRM` · `Pipeline report` · `Deal summary`
- Chase: `Follow-up sequence` · `Re-engagement email` · `Check-in message`
- Mark: `Cold outreach email` · `LinkedIn DM` · `Sequence draft`
- Teo: `Competitor intel` · `Market signals` · `Sales brief`

**🤝 Customer Success**
- Purity: `Draft support reply` · `FAQ update` · `Ticket summary`
- Bruce: `Onboarding sequence` · `Welcome email` · `Setup guide`
- Nadia: `Retention email` · `Win-back campaign` · `Churn analysis`
- John: `NPS survey` · `Feedback form` · `Satisfaction report`
- Beatrice: `Health score report` · `At-risk accounts` · `Success metrics`

**🛡️ Tech & Security**
- Ghost: `Scan repository` · `Check dependencies` · `Security report`
- Cipher: `Review PR` · `Code audit` · `Review auth flow`
- Wren: `Deploy to staging` · `Check build` · `DevOps report`
- Hex: `Update README` · `Write API docs` · `Document function`
- Volt: `Incident report` · `Error analysis` · `Uptime check`

**🧠 People & Hiring**
- Marcus: `Source candidates` · `LinkedIn search` · `Talent pipeline`
- Vera: `Screen applicant` · `Scorecard` · `Interview questions`
- Zara: `Verify background` · `Reference check` · `Employment check`
- Eli: `Draft offer letter` · `Schedule interview` · `Rejection email`
- Nina: `Onboarding plan` · `Culture doc` · `First week schedule`

**📋 Operations**
- Atlas: `Project plan` · `Sprint breakdown` · `Milestone tracker`
- Cal: `Schedule meeting` · `Block focus time` · `Weekly agenda`
- Dean: `Meeting notes` · `SOP document` · `Team update`
- Iris: `Triage inbox` · `Draft reply` · `Email summary`
- Owen: `Task list` · `Process checklist` · `Coordination update`

**📊 Finance & Legal**
- Bill: `Create invoice` · `Payment reminder` · `Invoice summary`
- Felix: `Expense report` · `Reconcile transactions` · `Monthly spend`
- Lena: `Draft contract` · `Review agreement` · `NDA template`
- Reid: `Budget forecast` · `Spend analysis` · `Q report`
- Cora: `Financial audit` · `Revenue report` · `Cost breakdown`

**🔍 Intelligence**
- Roman: `Market research` · `Competitor analysis` · `Industry deep dive`
- Sage: `Monitor mentions` · `Signal report` · `Trend watch`
- Nate: `Weekly brief` · `News summary` · `Key takeaways`
- Ada: `Revenue forecast` · `Growth model` · `Scenario analysis`
- Dex: `Trend report` · `Emerging topics` · `Opportunity scan`

**🌐 Community & Growth**
- Spike: `Growth experiment` · `Viral hook` · `Launch strategy`
- Milo: `Community update` · `Member spotlight` · `Event post`
- Rio: `Partnership outreach` · `Collab proposal` · `Partner brief`
- Zoe: `Influencer list` · `Outreach DM` · `Campaign brief`
- Kai: `Brand amplification` · `Share strategy` · `Audience growth`

---

## UPDATE 4 — OrcaHub Templates (Templates not showing)

The OrcaHub page is empty. Fix this in two parts:

**Part A — Seed the templates into the database**

Run this SQL in Supabase SQL editor (from backend_connect.md Step 5 — the full INSERT statement with all 6 templates). If already run, check the `orcahub_templates` table has 6 rows.

**Part B — Fix the frontend fetch**

The OrcaHub page must call `GET /api/orcahub` on load and render the template cards.

Each template card shows:
```
[Preview image / emoji placeholder]
[Template name]           [Plan badge e.g. FREE / STARTER / PRO]
[Category tag]
[Agent + dept count e.g. "4 departments · 16 agents"]
[One-line description]
[Install count — small muted text]
[Preview →]  [Install →]  buttons
```

If already installed → show `✓ Installed` green badge, disable Install button.
If plan too low → show `🔒 Requires Pro` badge, disable Install button.

**The 6 official templates to show:**

| Emoji | Name | Plan | Depts | Agents |
|-------|------|------|-------|--------|
| 🚀 | SaaS Startup | Free | 4 | 16 |
| 📣 | Content Marketing Agency | Starter | 4 | 18 |
| 🛒 | E-commerce Operator | Starter | 4 | 19 |
| 💼 | Recruiting Firm | Pro | 4 | 17 |
| 🛠️ | Dev Agency | Pro | 4 | 19 |
| 🔍 | Intelligence & Research Desk | Pro | 3 | 15 |

**Filter pills above the grid:**
`All · Startup · Marketing · E-commerce · Hiring · Technology · Research`

---

## UPDATE 5 — Default Plan Selection in Onboarding

Users currently don't know which plan they're on during onboarding. Add plan selection as **Step 0** before the company identity form.

**Add a new first step to onboarding — "Choose your plan"**

Show the 3 plan cards:

```
┌─────────────────────────────────────────────────────────────┐
│  Start with the right plan for where you are.               │
│  All plans include a 14-day free trial. No credit card.     │
└─────────────────────────────────────────────────────────────┘

[STARTER — $99/mo]          [PRO — $199/mo ⭐]          [ENTERPRISE — $399/mo]
3 departments               All 9 departments            All 9 + custom training
15 agents                   All 45 agents                Unlimited members
3 team members              10 team members              Ollama support
CyberGuard included         Full Nexonic ecosystem       24/7 concierge
                            BYOLLM + OrcaHub

[Choose Starter]            [Choose Pro]                 [Choose Enterprise]
```

**What happens when they select a plan:**
- Store selected plan in local state (not charged yet — trial starts)
- Show selected plan highlighted with green border
- Continue button activates
- On final onboarding step 5 — trigger Paystack checkout for selected plan
- If user skips payment → default to Starter trial, no payment required

**Note below the cards:**
`You can change your plan anytime from Account → Billing. All plans start with a 14-day free trial.`

---

## UPDATE 6 — Teams Tab — Invite Members

The Teams tab is missing the invite functionality. Add two invite methods:

**Method 1 — Invite by email**

Add an "Invite Member" button top right of the Teams page.

When clicked → open a modal:
```
┌─────────────────────────────────────────────┐
│  Invite a team member                        │
│                                             │
│  Email address *                            │
│  [                                    ]     │
│                                             │
│  Role *                                     │
│  [Co-founder ▾]                            │
│  Co-founder / Department Head / Member /    │
│  Advisor                                   │
│                                             │
│  Department (required for Head and Member) │
│  [Marketing ▾]                             │
│                                             │
│  [Cancel]           [Send Invite →]         │
└─────────────────────────────────────────────┘
```

On submit → call `POST /api/org/members/invite` with email, role, department_key.
Backend sends invite email via Resend with the accept link.
Show toast: "Invite sent to email@example.com"

**Method 2 — Invite by link**

Next to the Invite button add a "Copy invite link" button.

When clicked:
1. Call `POST /api/org/members/invite-link` → generates a token
2. Returns: `https://orca-sigma.vercel.app/invite/accept/[token]`
3. Copy to clipboard automatically
4. Show toast: "Invite link copied — share it with your team member"

The invite link expires in 7 days (matches the `invite_tokens` table `expires_at`).

**Teams page layout:**

```
TEAMS                                    [Invite Member ▾] [Copy invite link]

MEMBERS (3)
┌────────────────────────────────────────────────────────────────┐
│  👤  Kale Francis          Owner/CEO        All departments    │
│  👤  [Pending invite]      Head             Marketing    ...   │
└────────────────────────────────────────────────────────────────┘

PENDING INVITES (1)
┌────────────────────────────────────────────────────────────────┐
│  📧  email@example.com     Member           Sales       [Resend] [Cancel] │
└────────────────────────────────────────────────────────────────┘
```

---

## UPDATE 7 — Integration Icons (OAuth apps missing icons)

The integrations page is missing brand icons/logos for each connected service. Add proper icons for all OAuth integrations.

**Use these icon sources (all free, no licensing issues for UI use):**
- Simple Icons: `simpleicons.org` — SVG icons for all major tech brands
- Or use the first letter avatar as fallback with brand color

**Icon + brand color per service:**

| Service | Icon | Brand color |
|---------|------|-------------|
| GitHub | `simple-icons:github` | `#24292e` |
| Google | `simple-icons:google` | `#4285F4` |
| LinkedIn | `simple-icons:linkedin` | `#0A66C2` |
| Twitter/X | `simple-icons:x` | `#000000` |
| Slack | `simple-icons:slack` | `#4A154B` |
| Notion | `simple-icons:notion` | `#000000` |
| HubSpot | `simple-icons:hubspot` | `#FF7A59` |
| Meta/Facebook | `simple-icons:meta` | `#0082FB` |
| Instagram | `simple-icons:instagram` | `#E4405F` |
| Stripe | `simple-icons:stripe` | `#635BFF` |
| Vercel | `simple-icons:vercel` | `#000000` |
| Sentry | `simple-icons:sentry` | `#362D59` |
| Ahrefs | Letter A avatar | `#FF7043` |
| Apollo | Letter A avatar | `#1D2C4D` |
| Mailchimp | `simple-icons:mailchimp` | `#FFE01B` |
| Intercom | `simple-icons:intercom` | `#6AFDEF` |
| Zendesk | `simple-icons:zendesk` | `#03363D` |
| Discord | `simple-icons:discord` | `#5865F2` |
| Perplexity | Letter P avatar | `#20B8CD` |
| QuickBooks | Letter Q avatar | `#2CA01C` |

**Install Simple Icons:**
```bash
npm install simple-icons
```

**Integration card layout:**
```
┌─────────────────────────────────────────────┐
│  [ICON]  GitHub                [Connected ✓]│
│          Tech & Security                    │
│          Ghost · Cipher · Wren · Hex · Volt │
│                              [Disconnect]   │
└─────────────────────────────────────────────┘
```

For disconnected services:
```
┌─────────────────────────────────────────────┐
│  [ICON]  Slack                              │
│          Operations                         │
│          Iris · Owen · Milo                 │
│                              [Connect →]    │
└─────────────────────────────────────────────┘
```

---

## UPDATE 8 — Review Center Redesign

The current Review Center looks plain. Looking at the screenshots — it shows GOVERNANCE PROTOCOL ALPHA as the heading with stat cards that show 0. Redesign it to be more useful and better looking.

**New Review Center layout:**

**Header:**
```
REVIEW CENTER                    [0 DECISIONS PENDING — green badge]
Your command queue. Approve, reject, or redirect.
```

**Top stat row (4 cards horizontal):**
```
[Pending Approvals: 0]  [Coord Events Today: 0]  [Dept Reports: —]  [Team Online: —]
```
Make these smaller — they're stat cards not the main focus. Remove the oversized GOVERNANCE PROTOCOL ALPHA heading. Replace with a cleaner section title.

**Below stats — two column layout:**

Left column (60% width) — APPROVAL QUEUE:
```
┌─────────────────────────────────────────────────────────┐
│  APPROVAL QUEUE                              [Filter ▾]  │
│                                                          │
│  When agents complete tasks that need your review,      │
│  they appear here. Brief an agent to get started.       │
│                                                          │
│  [Empty state illustration — simple, not "QUEUE CLEAR"] │
│  No decisions pending right now.                        │
└─────────────────────────────────────────────────────────┘
```

When approvals exist, each card shows:
```
┌─────────────────────────────────────────────────────────┐
│  🎙️ Aria · Marketing                    [URGENT / INFO] │
│  "Draft LinkedIn post about Q1 results"                 │
│  Result: 3 LinkedIn posts ready for review              │
│                                                         │
│  [View full output]    [✓ Approve]    [✗ Reject]        │
└─────────────────────────────────────────────────────────┘
```

Right column (40% width) — COORDINATION LOG:
```
┌───────────────────────────────────────────┐
│  COORDINATION LOG                          │
│                                           │
│  No coordination events yet.              │
│  This feed updates live as agents         │
│  hand off work between departments.       │
│                                           │
│  [Empty state — simple]                   │
└───────────────────────────────────────────┘
```

When events exist, each shows:
```
🎙️ Aria → 💰 Rex
12 warm leads handed off with context
Marketing → Sales · 2 min ago · Auto-approved
```

**Remove:**
- The word "GOVERNANCE PROTOCOL ALPHA" — too jargon-heavy
- The oversized heading taking half the screen
- The plain dashes (—) for empty Dept Reports and Team Online

**Replace empty states with:**
- Dept Reports: "No reports submitted yet. Reports appear here after agents complete weekly summaries."
- Team Online: "No team members added yet. Invite your team from the Teams page."

---

## DEPLOYMENT ORDER

Do all 8 updates in one branch. Test locally. Deploy once.

After deploying verify:
1. Agent input is compact — one line height by default
2. + icon opens upload menu with department-specific suggestions
3. Quick prompt pills are agent-specific and sit above the input
4. OrcaHub shows 6 template cards (seed if empty)
5. Onboarding Step 0 shows plan selection before company identity
6. Teams page has Invite Member button and Copy invite link
7. Integration cards show brand icons
8. Review Center has cleaner layout without GOVERNANCE PROTOCOL ALPHA heading

---

*Nexonic Industries · orca-sigma.vercel.app*