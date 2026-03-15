# ORCA — Pages Content Specification
## pages.md · Nexonic Industries · AI Company OS
### Docs · Terms · Privacy Policy · Security

---

# PART 1 — DOCUMENTATION

---

## Getting Started

### Introduction

ORCA is an AI Company OS built by Nexonic Industries. It gives any company — from a solo founder to a 15-person team — a full AI workforce across 9 departments and 45 specialized agents, all coordinated in one dashboard.

ORCA is not a chatbot. It is not a prompt tool. It is not another automation layer on top of your existing tools. ORCA is an operating system for your company. Agents have roles, memory, and the ability to coordinate with each other across departments — just like a real team would.

**What ORCA replaces:**
- The need to hire a full Marketing, Sales, Ops, Finance, Tech, and Hiring team
- The 8–12 disconnected tools you're currently using and manually bridging
- The hours you spend being the bottleneck between departments

**What ORCA gives you:**
- 9 AI departments with 45 named, specialized agents
- Cross-department coordination with human approval gates
- Role-based access for your human team (Owner, Co-founder, Head, Member, Advisor)
- The full Nexonic ecosystem (CyberGuard, Render.AI, Intuition, The Summit, Island of Relevancy) built in

**Who ORCA is for:**
Solo founders, co-founders, indie hackers, and early-stage startups with 1–15 people who need to operate like a scaled company without the payroll to match.

---

### Installation

ORCA is a web-based platform. There is nothing to install.

**To get started:**
1. Go to nexonic-industries.vercel.app
2. Click "Join Early Access" or "Start Free Trial"
3. Create your account with your email and password
4. Complete the 5-step onboarding flow
5. Your dashboard is live

**System requirements:**
- Any modern browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- No downloads, no plugins, no extensions required

**Mobile:**
ORCA works on mobile browsers. A dedicated mobile app is on the roadmap.

**API access:**
API access is available on the Enterprise plan. See the Custom API section in Integrations for setup instructions.

---

### Quick Start Guide

**Step 1 — Create your account**
Sign up at nexonic-industries.vercel.app. You'll receive a welcome email from ORCA via Resend confirming your account.

**Step 2 — Complete onboarding (5 minutes)**
The onboarding flow collects your company context. This is what your agents use to understand who they're working for. Do not skip it — the more context you provide, the better your agents perform.

- Brief your workforce: your name, company name, mission, brand voice, and ICP
- Build your org chart: choose which departments to activate
- Set operating mode: Autopilot, Approve First, or Suggest Only
- Connect your stack: link the tools your agents will work with
- Give your first order: brief your first agent

**Step 3 — Brief your first agent**
Open a department from the sidebar. Click an agent pill. Type your brief in the input box. Hit send.

Your agent will:
- Acknowledge the brief
- Execute the task using your company context
- Return a result card with action items
- Wait for your approval before any external action is taken (if on Approve First mode)

**Step 4 — Review and approve**
If your operating mode is Approve First, agent outputs appear with an Approve button. Review the output. Click Approve to execute or Reject to cancel.

**Step 5 — Watch the coordination feed**
As your agents work, cross-department handoffs appear in the Coordination Feed on your Command Center. This is where you see agents passing work to each other in real time.

---

## Core Concepts

### The Org Chart

ORCA is built around a company org chart — not a flat list of AI tools. Every element of ORCA maps to how a real company is structured.

**The hierarchy:**

```
Owner / CEO
  └── Co-founder (optional, same access level)
      └── Department Heads (one per department)
          └── Department Members
              └── AI Agents (5 per department)
```

**How it works in practice:**
- The Owner sees everything — all departments, all agent activity, all approval queues, all team reports
- Department Heads manage their department, approve agent actions within it, and approve or reject incoming cross-department requests
- Members brief agents in their assigned department only
- AI Agents execute tasks, coordinate with each other, and escalate to humans when required

**Why this matters:**
Most AI tools give you a single agent doing a single task. ORCA gives you a structured workforce where every agent knows their role, their department, and who they report to. This is what makes coordination possible.

---

### Department Mapping

ORCA has 9 departments. Each maps to a real company function.

| Department | What it covers | Agents |
|-----------|---------------|--------|
| 📣 Marketing | Content, social, SEO, ads, brand voice | Aria, Jackie, Eric, Lucy, Joe |
| 💼 Sales & Revenue | Lead prospecting, outreach, CRM, follow-up, intel | Rex, Clara, Chase, Mark, Teo |
| 🤝 Customer Success | Support, onboarding, retention, NPS, health | Purity, Bruce, Nadia, John, Beatrice |
| 🛡️ Tech & Security | Security, code review, DevOps, docs, incidents | Ghost, Cipher, Wren, Hex, Volt |
| 🧠 People & Hiring | Talent sourcing, screening, verification, offers, culture | Marcus, Vera, Zara, Eli, Nina |
| 📋 Operations | Project management, calendar, notes, inbox, coordination | Atlas, Cal, Dean, Iris, Owen |
| 📊 Finance & Legal | Invoicing, expenses, contracts, budget, audit | Bill, Felix, Lena, Reid, Cora |
| 🔍 Intelligence & Research | Research, market signals, summaries, forecasting, trends | Roman, Sage, Nate, Ada, Dex |
| 🌐 Community & Growth | Growth experiments, community, partnerships, influencers, brand | Spike, Milo, Rio, Zoe, Kai |

**Plan access:**
- Free: 1 department (your choice)
- Starter: 3 departments
- Pro: All 9 departments
- Enterprise: All 9 + custom agent training

---

### Agent Roster

ORCA has 45 specialized agents — 5 per department. Each agent has a name, a role, a unique icon, and 5 quick prompts that appear when you select them.

**How agents are displayed:**
Each agent appears as a pill above the input box in their department workspace. The pill shows the agent's icon, name, and role truncated. Click a pill to open that agent's full workspace — their hero header, status, task count, and message thread.

**Agent memory:**
Every agent has access to your company context (name, mission, brand voice, ICP, competitors) from your Company Identity settings. This context is injected into every agent's system prompt so they always know who they're working for.

**Agent status:**
- 🟢 Active — agent is currently executing a task
- 🟡 Busy — agent has a task queued
- ⚫ Idle — agent is available

**Full agent list:** See agents.md for the complete roster with icons, roles, quick prompts, and implementation notes.

---

### Role Definitions

ORCA has 5 human roles. Each has different access to the dashboard.

**Owner / CEO**
- Full access to everything
- Sees all 9 departments (plan-gated)
- Accesses Review page, Teams page, Billing, Account settings (all 7 tabs)
- Can invite all role types
- Only person who can delete the organisation
- Default role when you sign up

**Co-founder**
- Same access as Owner — full dashboard, full team management
- Cannot delete the organisation
- Cannot change the Owner's role
- Can invite Co-founders, Heads, Members, Advisors
- Does not see Billing tab by default (Owner can grant access)

**Department Head**
- Scoped to their assigned department only
- Approves all agent tasks within their department
- Approves or rejects incoming cross-department handoff requests
- Submits weekly department report to Owner/Co-founder
- Can invite Members to their own department only
- Cannot see other departments, billing, company-wide stats, or teams page

**Member**
- Scoped to their assigned department only
- Can brief agents in their department freely
- Cross-department requests require Head approval first
- Can message their Department Head via Team Chat
- Cannot see other departments, billing, or team management
- Cannot invite anyone

**Advisor**
- Read-only access
- Can view department reports and agent activity
- Cannot brief agents or approve anything
- Cannot invite anyone

---

### Operating Modes

Every department in ORCA can be set to one of three operating modes. You set this globally during onboarding and can adjust per department in Account → Agent Permissions.

**Autopilot**
Agents execute tasks automatically without waiting for approval. Everything is logged in the audit trail. Agents notify you of what they did after the fact. Best for: routine tasks you fully trust, like scheduling, meeting notes, daily summaries.

**Approve First** (recommended for most tasks)
Agents prepare the full output and wait for your approval before taking any external action. You review the result card, click Approve or Reject. Nothing goes out — no posts published, no emails sent, no code deployed — until you say so. Best for: anything that touches customers, code, or money.

**Suggest Only**
Agents draft outputs and deliver them to you for review. They do not attempt to execute externally even if approved — they hand the suggestion to you and you execute manually. Best for: when you want AI assistance but prefer to handle execution yourself.

**Master kill switch:**
In Account → Agent Permissions, there is a Pause All Agents toggle. When activated, all agent activity across all departments stops immediately. Use this if something goes wrong or if you need to step away.

---

## Coordination

### Hand-offs

A hand-off is when one agent passes work to another agent in a different department. Hand-offs are the core mechanic that makes ORCA feel like a real team rather than isolated tools.

**Example:**
Aria (Marketing) warms up 47 leads through a LinkedIn content campaign. She detects that these leads are ready for sales outreach. She drafts a hand-off request:
- What: 47 warm lead profiles with intent signals
- Why: ready for outreach sequencing
- Target: Rex (Sales & Revenue)
- Action Rex would take: draft personalised outreach sequences

This hand-off request goes to the Head of Marketing (approving the outgoing request) and the Head of Sales (approving the incoming request). Both approve. Rex receives the leads with full context. Rex doesn't start cold — he starts informed.

**Hand-off approval chain:**
1. Agent detects cross-department need and flags it with `[COORDINATION_NEEDED]`
2. Head of the requesting department is notified — approves the outgoing request
3. Head of the receiving department is notified — approves the incoming request
4. Both approved → receiving agent executes
5. Coordination event logged → appears in Owner's coordination feed
6. If no Head assigned to either department → escalates directly to Owner/CEO

**Auto-approved hand-offs:**
Low-stakes informational handoffs (e.g. Oracle passing a market summary to Nate for a digest) are auto-approved and logged without requiring human intervention.

---

### Triggers

A trigger is an automatic action one agent takes based on an event in another department — without requiring a manual brief.

**Built-in triggers:**

| Trigger event | Agent that fires | Action taken |
|--------------|-----------------|--------------|
| Deal closes in CRM | Clara (Sales) → Bruce (CS) | Onboarding sequence triggered automatically |
| New candidate passes screening | Vera (Hiring) → Zara (Hiring) | Background verification initiated |
| Security vulnerability detected | Ghost (Tech) → Volt (Tech) | Incident response triggered, PR opened |
| New lead added to pipeline | Rex (Sales) → Chase (Sales) | Follow-up sequence queued |
| Blog post published | Jackie (Marketing) → Sage (Intel) | Performance tracking initiated |
| Budget threshold reached | Reid (Finance) → Atlas (Ops) | Spending alert sent to Owner |

**Custom triggers:**
Enterprise plan users can configure custom triggers via the API. See Custom API documentation.

---

### Protocol Alpha

Protocol Alpha is ORCA's internal coordination standard. Every cross-department hand-off, trigger, and agent communication follows Protocol Alpha to ensure consistency, traceability, and human control.

**Protocol Alpha defines:**
- How agents flag coordination needs in their responses (`[COORDINATION_NEEDED: dept=X, agent=Y, reason=Z]`)
- How hand-off context is packaged and passed between agents
- The maximum coordination chain depth (3 hops) before escalation to a human
- How auto-approval eligibility is determined (task type, stake level, plan)
- How every coordination event is logged to the audit trail

**Coordination depth limit:**
ORCA enforces a maximum chain depth of 3. If Agent A hands off to Agent B who hands off to Agent C who tries to hand off to Agent D, the chain is stopped at depth 3. The Owner is notified and must decide whether to continue manually. This prevents infinite coordination loops.

---

### Sync Mechanisms

ORCA uses Supabase Realtime to keep your dashboard live without manual refresh.

**What updates in real time:**
- New agent messages in conversation threads
- Coordination feed events (new hand-offs, triggers, alerts)
- Approval request notifications (badge count updates)
- Team chat messages (Head ↔ Member)
- Agent status changes (idle → active → busy)

**How it works:**
Supabase Realtime uses WebSocket connections with PostgreSQL change notifications. When a new row is inserted into `messages`, `coordination_events`, `approval_requests`, or `team_messages`, your dashboard receives the update within milliseconds.

**Connection management:**
ORCA automatically cleans up WebSocket subscriptions when you navigate between pages. If your connection drops, ORCA reconnects automatically on your next interaction.

---

## Integrations

### GitHub Setup

**Who uses this:** Ghost (Security Scanner), Cipher (Code Reviewer), Wren (DevOps), Hex (Docs Agent), Volt (Incident Response)

**Setup:**
1. Go to Dashboard → Integrations → Tech & Security
2. Click Connect next to GitHub
3. Authorize ORCA via GitHub OAuth
4. Select which repositories ORCA agents can access
5. Choose permission level: Read only (for reviews/docs) or Read + Write (for PR creation and deployments)

**What agents can do once connected:**
- Ghost scans your repository for security vulnerabilities on a schedule and opens fix PRs automatically
- Cipher reviews pull requests when triggered and adds review comments
- Wren can trigger deployments via GitHub Actions
- Hex reads and writes to your documentation files and README
- Volt monitors GitHub for critical alerts and incident signals

**Repository permissions:**
ORCA requests the minimum permissions required per agent. Ghost and Cipher request read access only by default. Wren requests workflow permissions only if you enable deployment actions. You can revoke access at any time from Integrations.

---

### Stripe Bridge

> **Note for Kenyan users:** ORCA itself uses Paystack for billing (not Stripe). The Stripe Bridge integration is for connecting YOUR Stripe account so ORCA's Finance agents can read and act on your business revenue data.

**Who uses this:** Bill (Invoicing), Felix (Expense Tracker), Reid (Budget Agent), Cora (Financial Review)

**Setup:**
1. Go to Dashboard → Integrations → Finance & Legal
2. Click Connect next to Stripe
3. Enter your Stripe Restricted API Key (never your full secret key)
4. Select which data agents can access: Customers / Invoices / Payments / Subscriptions

**Creating a restricted key in Stripe:**
1. Go to Stripe Dashboard → Developers → API Keys
2. Click Create restricted key
3. Enable: Customers (read), Invoices (read + write), Payment Intents (read), Subscriptions (read)
4. Copy the key and paste it into ORCA's Stripe integration field

**What agents can do once connected:**
- Bill reads outstanding invoices and can create new ones
- Felix pulls transaction data for expense reconciliation
- Reid reads subscription and revenue data for budget forecasting
- Cora audits financial records and flags discrepancies

**Security note:** ORCA encrypts your Stripe key using AES-256-GCM before storing it. The raw key is never stored in plaintext and never returned to the browser.

---

### Slack Notifications

**Who uses this:** All agents — notifications are sent to Slack when agents complete tasks, request approvals, or detect issues

**Setup:**
1. Go to Dashboard → Integrations → Operations
2. Click Connect next to Slack
3. Authorize ORCA via Slack OAuth
4. Select which workspace and channels to use
5. Configure which notification types go to which channels

**Recommended channel setup:**
- `#orca-activity` — all agent completions and task logs
- `#orca-approvals` — approval requests needing your review
- `#orca-alerts` — urgent escalations (security vulnerabilities, critical incidents)
- `#orca-coordination` — cross-department hand-off events

**Notification types:**
- Agent task completed (with result summary)
- Approval request raised (with link to Review page)
- Cross-department hand-off approved or rejected
- Department Head weekly report submitted
- Security alert from Ghost (CyberGuard)
- Coordination loop detected (chain depth exceeded)
- Master kill switch activated

---

### Custom API

**Available on:** Enterprise plan only

ORCA's API allows Enterprise customers to:
- Trigger agent briefs programmatically
- Read coordination events and audit logs
- Create custom triggers based on external events
- Build custom integrations with internal tools
- Query agent activity data for external reporting

**Base URL:**
```
https://api.nexonic-industries.vercel.app/v1
```

**Authentication:**
All API requests require a Bearer token. Generate your API key from Account → Security → API Keys (Enterprise only).

```bash
curl -X POST https://api.nexonic-industries.vercel.app/v1/agents/brief \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "aria",
    "department": "marketing",
    "brief": "Write 3 LinkedIn posts about our Q2 product launch"
  }'
```

**Rate limits:**
- 1,000 requests per hour per API key
- 10 concurrent agent briefs per organisation
- Webhook delivery retries: 3 attempts with exponential backoff

**Webhook events:**
Configure a webhook URL in Account → Integrations → API to receive real-time events:
- `agent.task.completed`
- `agent.coordination.requested`
- `agent.coordination.approved`
- `approval.request.created`
- `approval.request.resolved`
- `plan.upgraded`
- `plan.cancelled`

Full API reference documentation is available at docs.nexonic-industries.vercel.app/api (coming soon).

---

## Security

### Data Isolation

ORCA is a multi-tenant platform. Every organisation's data is completely isolated from every other organisation.

**How isolation is enforced:**

**Row Level Security (RLS):** Every table in ORCA's database has RLS enabled. This means even if a valid authenticated request is made, the database itself will only return rows belonging to the requesting user's organisation. A user from Organisation A cannot read, write, or query any data belonging to Organisation B — at any layer.

**Organisation ID scoping:** Every piece of data in ORCA — conversations, messages, agents, approvals, coordination events, integrations — has an `org_id` column. Every query filters by this `org_id`, which is derived from the authenticated session (never from user input).

**Department scoping:** Within an organisation, Members and Heads can only access data from their assigned department. A Sales Member cannot read Marketing conversations. A Marketing Head cannot see Finance reports. This is enforced at both the API layer and the database layer.

**AI context isolation:** Agent system prompts are built from your organisation's company identity data only. No agent ever has access to another organisation's context, conversations, or company data. Each LLM call is scoped to a single conversation in a single organisation.

**Session management:** ORCA uses Supabase Auth with JWT tokens. Sessions expire after 7 days. When a team member is removed from an organisation, their session is invalidated within seconds — not after token expiry.

---

### Encryption Standards

**Data at rest:**
All data stored in ORCA's Supabase database is encrypted at rest using AES-256, managed by Supabase's infrastructure.

**Integration tokens:**
OAuth tokens and API keys for connected integrations (GitHub, Slack, Stripe, LinkedIn, etc.) are encrypted using AES-256-GCM with authenticated encryption before being stored in the database. The raw token is decrypted server-side only when an agent needs to execute an action — it is never returned to the browser or included in any API response.

**Data in transit:**
All data transmitted between your browser and ORCA's servers is encrypted using TLS 1.3. WebSocket connections (used for real-time updates) are also TLS-encrypted.

**Passwords:**
User passwords are hashed using bcrypt via Supabase Auth. ORCA never stores plaintext passwords.

**Encryption key management:**
ORCA's encryption keys are stored as environment variables in Vercel. They are never committed to source code, never logged, and are rotated on a schedule. If you believe your account has been compromised, contact security@nexonic.com immediately.

---

### Audit Logs

Every significant action in ORCA is recorded in an immutable audit log. The audit log is append-only — entries can never be modified or deleted.

**What is logged:**

| Action | Who triggered it |
|--------|-----------------|
| Agent task approved | User |
| Agent task rejected | User |
| Cross-dept hand-off approved | User |
| Cross-dept hand-off rejected | User |
| Team member invited | User |
| Team member removed | User |
| Member role changed | User |
| Plan upgraded | User |
| Plan cancelled | System (Paystack webhook) |
| Integration connected | User |
| Integration disconnected | User |
| Master kill switch toggled | User |
| Agent operating mode changed | User |
| Department Head assigned | User |
| CEO acknowledged department report | User |
| Prompt injection attempt detected | System |
| Roleplay injection attempt detected | System |
| Agent permission escalation attempt | System |
| Coordination loop detected | System |

**Accessing your audit log:**
Audit logs are available to Owners and Co-founders from Account → Security → Audit Log. You can filter by date, actor, action type, and resource. Logs are retained for 12 months on Pro and Enterprise plans, and 30 days on Starter.

**Exporting your audit log:**
Enterprise customers can export audit logs as JSON or CSV from the audit log interface or via the API.

---

### SOC 2 Compliance

ORCA is currently working toward SOC 2 Type II certification. This section describes our current security posture and the controls we have in place.

**Current security controls:**

| Control | Status |
|---------|--------|
| Data encryption at rest | ✓ Active |
| Data encryption in transit (TLS 1.3) | ✓ Active |
| Integration token encryption (AES-256-GCM) | ✓ Active |
| Row Level Security on all tables | ✓ Active |
| Audit logging | ✓ Active |
| Session invalidation on member removal | ✓ Active |
| Rate limiting on all API routes | ✓ Active |
| Prompt injection detection | ✓ Active |
| Input sanitisation | ✓ Active |
| Webhook signature verification | ✓ Active |
| Duplicate payment prevention | ✓ Active |

**Infrastructure:**
ORCA runs on Vercel (compute) and Supabase (database + auth + storage). Both providers maintain their own SOC 2 certifications. You can request their compliance documentation from their respective trust portals.

**Data residency:**
ORCA's database is hosted in a Supabase region. Enterprise customers can request a specific region for their data. Contact support@nexonic.com for data residency options.

**Vulnerability disclosure:**
If you discover a security vulnerability in ORCA, please report it to security@nexonic.com. We aim to acknowledge reports within 24 hours and provide a resolution timeline within 72 hours. We do not pursue legal action against good-faith security researchers.

**SOC 2 timeline:**
We are targeting SOC 2 Type II certification within 12 months of launch. Enterprise customers requiring SOC 2 prior to this can request our current security questionnaire and controls documentation from security@nexonic.com.

---

# PART 2 — TERMS OF SERVICE

**Last updated:** March 2026
**Effective date:** March 2026

---

## 1. Acceptance of Terms

By creating an account on ORCA or accessing any part of the nexonic-industries.vercel.app platform, you agree to be bound by these Terms of Service. If you are using ORCA on behalf of an organisation, you represent that you have the authority to bind that organisation to these terms.

If you do not agree to these terms, do not create an account or use the platform.

---

## 2. Description of Service

ORCA is an AI Company OS provided by Nexonic Industries. The service includes:
- Access to AI agents across up to 9 departments depending on your subscription plan
- Cross-department coordination and automation tools
- Team management and role-based access features
- Integrations with third-party services
- Access to Nexonic ecosystem products (CyberGuard, Render.AI, Intuition, The Summit, Island of Relevancy) as included in your plan

The service is provided on a subscription basis. Plan features, pricing, and availability are described on the pricing page and may change with notice.

---

## 3. Accounts and Registration

**Eligibility:** You must be at least 18 years old to create an account. By registering, you confirm you meet this requirement.

**Accurate information:** You agree to provide accurate, complete, and current information during registration and to keep your account information updated.

**Account security:** You are responsible for maintaining the security of your account credentials. You must notify us immediately at support@nexonic.com if you suspect unauthorised access to your account.

**One account per person:** Each individual may only create one account. Creating multiple accounts to circumvent plan limits or abuse the free trial is a violation of these terms and may result in account termination.

---

## 4. Subscriptions and Billing

**Subscription plans:** ORCA offers Starter, Pro, and Enterprise plans. Pricing is listed on the pricing page and is subject to change with 30 days notice to existing subscribers.

**Free trial:** All paid plans include a 14-day free trial. No credit card is required to start a trial. At the end of the trial, you will be asked to enter payment information to continue. If you do not upgrade, your account will revert to limited access.

**Billing:** ORCA uses Paystack for payment processing. By entering your payment information, you authorise Nexonic Industries to charge your payment method on a recurring basis (monthly or annually, depending on your selection).

**Annual billing:** Annual plans are billed upfront for 12 months. The effective monthly rate is lower than the monthly plan rate as described on the pricing page.

**Founding member pricing:** Early access members who subscribe during the early access period lock in their plan price permanently, even as prices increase for new subscribers.

**Cancellation:** You may cancel your subscription at any time from Account → Billing → Cancel Subscription. Cancellation takes effect at the end of your current billing period. No partial refunds are issued for unused time on monthly plans.

**Refunds:** We offer a full refund within 7 days of your first payment if ORCA does not meet your expectations. After 7 days, payments are non-refundable. To request a refund, contact support@nexonic.com.

**Failed payments:** If a payment fails, we will retry on days 3, 7, and 14. After 3 failed attempts, your account will be downgraded to limited access until payment is resolved.

---

## 5. Acceptable Use

You agree not to use ORCA to:

- Violate any applicable law or regulation
- Generate, distribute, or assist in creating content that is illegal, harmful, defamatory, harassing, or obscene
- Attempt to reverse engineer, decompile, or extract the source code of ORCA
- Use automated scripts or bots to access the platform in ways that exceed normal usage
- Attempt to circumvent rate limits, plan restrictions, or access controls
- Share your account credentials with others outside your organisation
- Use ORCA's AI agents to generate spam, phishing content, or malicious code
- Attempt to inject malicious prompts designed to manipulate agent behaviour
- Use the platform to harm, deceive, or defraud other people
- Scrape or harvest data from the platform for competitive intelligence

Violation of these terms may result in immediate account suspension or termination without refund.

---

## 6. AI-Generated Content

ORCA's agents generate content using large language models (Gemini 1.5 Pro and Groq Llama 3.3 70B). You acknowledge that:

- AI-generated content may contain errors, inaccuracies, or outdated information
- You are responsible for reviewing all agent outputs before using them externally
- ORCA's Approve First mode is designed to give you control before any content is published, sent, or executed
- Nexonic Industries is not liable for any decisions made based on AI-generated content
- You own all content generated by ORCA agents on your behalf

---

## 7. Intellectual Property

**Your data:** You retain full ownership of all data you input into ORCA, including your company identity, agent briefs, conversation history, and agent outputs.

**ORCA platform:** Nexonic Industries owns all intellectual property rights in the ORCA platform, including the software, design, agent architectures, coordination protocols, and brand. These terms do not grant you any rights to the ORCA platform beyond what is necessary to use the service.

**Feedback:** If you provide feedback, suggestions, or ideas about ORCA, you grant Nexonic Industries a non-exclusive, perpetual licence to use that feedback without compensation.

---

## 8. Data and Privacy

Your use of ORCA is also governed by our Privacy Policy, which is incorporated into these terms by reference. By using ORCA, you consent to the data practices described in the Privacy Policy.

We do not sell your data to third parties. We do not use your company data, agent briefs, or conversation history to train AI models. See the Privacy Policy for full details.

---

## 9. Third-Party Integrations

ORCA integrates with third-party services (GitHub, Slack, LinkedIn, Stripe, Paystack, and others). Your use of these integrations is subject to the terms and privacy policies of those third-party services. Nexonic Industries is not responsible for the availability, accuracy, or conduct of third-party services.

---

## 10. Limitation of Liability

To the maximum extent permitted by applicable law, Nexonic Industries and its founders, employees, and contractors are not liable for:

- Any indirect, incidental, special, or consequential damages arising from your use of ORCA
- Loss of data, revenue, or profits resulting from platform outages or errors
- Damages resulting from actions taken by AI agents (you are responsible for reviewing outputs before approving them)
- Damages resulting from unauthorised access to your account due to your failure to maintain account security

Our total liability to you for any claim arising from these terms or your use of ORCA shall not exceed the amount you paid to Nexonic Industries in the 3 months preceding the claim.

---

## 11. Indemnification

You agree to indemnify and hold harmless Nexonic Industries and its founders, employees, and contractors from any claims, damages, or expenses (including legal fees) arising from your use of ORCA, your violation of these terms, or your violation of any third party's rights.

---

## 12. Modifications to Terms

We may update these Terms of Service at any time. We will notify you of material changes via email or in-app notification at least 14 days before the changes take effect. Your continued use of ORCA after the effective date constitutes acceptance of the updated terms.

---

## 13. Termination

**By you:** You may terminate your account at any time by going to Account → Security → Delete Account.

**By us:** We may suspend or terminate your account immediately if you violate these terms, engage in fraudulent activity, or if we reasonably believe your use of the platform poses a risk to other users or the platform itself.

**Effect of termination:** Upon termination, your access to the platform ends immediately. You may request a data export before terminating your account. See the Privacy Policy for data retention details.

---

## 14. Governing Law

These terms are governed by the laws of Kenya. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya, unless otherwise required by applicable law in your jurisdiction.

---

## 15. Contact

For questions about these terms, contact:
**Nexonic Industries**
Email: legal@nexonic.com
Website: nexonic-industries.vercel.app

---

# PART 3 — PRIVACY POLICY

**Last updated:** March 2026
**Effective date:** March 2026

---

## 1. Introduction

Nexonic Industries ("we", "us", "ORCA") operates the AI Company OS platform at nexonic-industries.vercel.app. This Privacy Policy explains what data we collect, how we use it, and your rights regarding your data.

We are committed to protecting your privacy. We do not sell your personal data. We do not use your company data to train AI models. We give you full control over your data, including the right to export and delete it.

This policy applies to all users of ORCA including Owners, Co-founders, Department Heads, Members, and Advisors.

---

## 2. Data We Collect

**Account data:**
- Name, email address, job title
- Organisation name, industry, company stage
- Signup IP address (used for fraud prevention)
- Account creation date

**Company identity data (you provide this during onboarding):**
- Company mission, brand voice, ICP (Ideal Customer Profile)
- Target geography and competitor names
- Uploaded brand documents and logo
- Connected knowledge base URLs (Notion, Google Drive)

This data is used exclusively to provide context to your AI agents. It is never used for advertising, sold to third parties, or used to train AI models.

**Usage data:**
- Agent briefs (messages you send to agents)
- Agent responses and outputs
- Coordination events (cross-department hand-offs)
- Approval actions (approved/rejected)
- Feature usage patterns (which departments and agents you use most)

**Integration data:**
- OAuth tokens for connected services (GitHub, Slack, LinkedIn, etc.)
- These are encrypted using AES-256-GCM and stored securely

**Payment data:**
- Payment is processed by Paystack. We do not store your full card number, CVV, or payment credentials. We store your Paystack customer code and subscription code.

**Technical data:**
- Browser type and version
- Operating system
- IP address
- Session cookies (required for authentication)

---

## 3. How We Use Your Data

| Data type | How we use it |
|-----------|--------------|
| Account data | To provide and manage your account |
| Company identity | To build agent context — never for advertising or model training |
| Agent briefs and outputs | To deliver the service and improve response quality |
| Usage data | To improve ORCA and fix bugs |
| Integration tokens | To execute agent actions on connected services |
| Payment data | To manage billing via Paystack |
| Technical data | For security, fraud prevention, and platform stability |

---

## 4. Data We Do Not Collect or Do

- We do **not** sell your data to third parties
- We do **not** use your company data or agent conversations to train AI models
- We do **not** show you advertising
- We do **not** share your data with advertising networks
- We do **not** build advertising profiles based on your usage

---

## 5. Third-Party Services

ORCA uses the following third-party services to operate:

| Service | Purpose | Their Privacy Policy |
|---------|---------|---------------------|
| Supabase | Database, authentication, file storage | supabase.com/privacy |
| Vercel | Hosting and serverless functions | vercel.com/legal/privacy-policy |
| Google Gemini (via Google AI) | Primary AI model | policies.google.com/privacy |
| Groq | Fast AI inference | groq.com/privacy |
| Paystack | Payment processing | paystack.com/privacy |
| Resend | Transactional email | resend.com/privacy |
| Inngest | Background job processing | inngest.com/privacy |
| Composio | Agent action execution | composio.dev/privacy |

Your data may be processed by these services as part of delivering ORCA. Each service operates under their own privacy policy as linked above.

---

## 6. Data Retention

| Data type | Retention period |
|-----------|----------------|
| Account data | Until you delete your account |
| Company identity | Until you delete your account |
| Agent conversations | 12 months on Pro/Enterprise · 30 days on Starter |
| Coordination events | 12 months on Pro/Enterprise · 30 days on Starter |
| Audit logs | 12 months on Pro/Enterprise · 30 days on Starter |
| Payment records | 7 years (required by financial regulations) |
| Deleted account data | Purged within 30 days of deletion request |

---

## 7. Your Rights

You have the following rights regarding your data:

**Right to access:** You can export all your personal data from Account → Security → Export My Data. This includes your profile, company identity, conversation history, and team messages in JSON format.

**Right to deletion:** You can delete your account from Account → Security → Delete Account. This permanently deletes your profile, organisation, all agent conversations, coordination events, and team data. Payment records are retained for 7 years as required by law.

**Right to correction:** You can update your personal information at any time from Account → Profile.

**Right to portability:** Your data export (Account → Security → Export My Data) is provided in JSON format, which is machine-readable and portable.

**Right to object:** You can opt out of non-essential communications (product updates, newsletters) from Account → Notifications. You cannot opt out of transactional emails required to operate the service (account confirmations, payment receipts, security alerts).

To exercise any of these rights or for questions about your data, contact: privacy@nexonic.com

---

## 8. Cookies

ORCA uses the following cookies:

| Cookie | Purpose | Duration |
|--------|---------|----------|
| `sb-access-token` | Authentication session | 7 days |
| `sb-refresh-token` | Session refresh | 7 days |
| Analytics cookies | Anonymous usage analytics (Vercel Analytics) | 30 days |

We do not use advertising cookies. We do not use cross-site tracking cookies.

---

## 9. Children's Privacy

ORCA is not intended for users under 18 years of age. We do not knowingly collect personal data from children. If you believe a child has created an account, contact privacy@nexonic.com and we will delete the account.

---

## 10. International Transfers

Nexonic Industries is based in Nairobi, Kenya. Our infrastructure is hosted on Supabase and Vercel, which may process data in data centers outside Kenya. By using ORCA, you consent to the transfer of your data to these providers in accordance with their privacy policies.

Enterprise customers can request specific data residency regions. Contact privacy@nexonic.com for options.

---

## 11. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of material changes via email at least 14 days before they take effect. The "Last updated" date at the top of this page reflects the most recent revision.

---

## 12. Contact

For privacy-related questions or requests:
**Nexonic Industries**
Email: privacy@nexonic.com
Website: nexonic-industries.vercel.app

---

# PART 4 — SECURITY PAGE

---

## ORCA Security

At Nexonic Industries, security is not a feature — it is the foundation. Founders trust ORCA with their company's most sensitive information: their strategy, their ICP, their competitor intelligence, their financial data, and their team. We treat that trust seriously.

---

## Our Security Principles

**1. You own your data.**
Your company data, agent conversations, and outputs belong to you. We never use them for advertising, never sell them, and never use them to train AI models.

**2. Isolation by default.**
Every organisation in ORCA is completely isolated from every other. Multiple layers of enforcement — database policies, API checks, and session scoping — ensure that no user can ever access another organisation's data.

**3. Human control at every critical step.**
ORCA's Approve First mode means no external action is taken without your explicit approval. Agents prepare. Humans decide.

**4. Everything is logged.**
Every significant action — approvals, rejections, role changes, plan changes, integration connections, security events — is recorded in an immutable audit log that you can always access.

---

## Infrastructure Security

**Hosting:** Vercel (SOC 2 Type II certified)
**Database:** Supabase (SOC 2 Type II certified)
**Uptime target:** 99.9%
**DDoS protection:** Cloudflare (via Vercel)
**TLS version:** 1.3 minimum for all connections

---

## Data Security

| Layer | Standard |
|-------|---------|
| Data at rest | AES-256 (Supabase managed) |
| Integration tokens | AES-256-GCM with authenticated encryption |
| Data in transit | TLS 1.3 |
| Passwords | bcrypt (Supabase Auth) |
| API keys | Encrypted at rest, never returned to client |

---

## Access Controls

**Row Level Security:** Every database table has RLS enabled. The database itself rejects queries that cross organisation boundaries — even if the application layer is bypassed.

**Role-based access:** ORCA's role system (Owner, Co-founder, Head, Member, Advisor) enforces access at the API level before any database query is made.

**Session management:** Sessions expire after 7 days. Removed team members have their sessions invalidated within seconds — not after token expiry.

**Rate limiting:** All API routes are rate-limited to prevent abuse. Authentication attempts are limited to 10 per 15 minutes per user.

---

## AI Security

**Prompt injection detection:** ORCA scans every agent brief for known injection patterns before sending to the AI model. Detected attempts are blocked and logged.

**Output filtering:** Agent responses are filtered for harmful content before being saved and displayed.

**Context isolation:** Agent system prompts are scoped to a single organisation's data. No agent has access to another organisation's context or conversation history.

**Agent permission proxy:** Agents cannot perform actions that the briefing user is not authorised to perform directly. An agent is not a permission bypass.

---

## Payment Security

ORCA uses Paystack for payment processing. We never store full card numbers, CVV codes, or payment credentials. All payment data is handled directly by Paystack under their PCI-DSS compliance framework.

Webhook events from Paystack are verified using HMAC-SHA512 signature validation. Every webhook event is deduplicated to prevent double-processing.

---

## Incident Response

**Detection:** ORCA monitors for anomalous activity including unusual API call patterns, failed authentication spikes, and unexpected data access.

**Response time targets:**
- Critical (data breach, system compromise): 1 hour acknowledgement, 4 hour initial response
- High (service outage, payment failure): 2 hour acknowledgement, 8 hour resolution target
- Medium (agent errors, integration failures): 24 hour acknowledgement

**Communication:** In the event of a security incident affecting your data, we will notify you via email within 72 hours of becoming aware of the breach, as required by Kenya's Data Protection Act 2019.

---

## Responsible Disclosure

If you discover a security vulnerability in ORCA, please report it responsibly:

**Email:** security@nexonic.com
**Subject:** Security Vulnerability Report
**Include:** Description of the vulnerability, steps to reproduce, potential impact

**Our commitment:**
- We will acknowledge your report within 24 hours
- We will provide a resolution timeline within 72 hours
- We will not pursue legal action against good-faith security researchers
- We will credit you (with your permission) when the vulnerability is resolved

Please do not publicly disclose vulnerabilities before we have had a reasonable opportunity to address them.

---

## Compliance

| Standard | Status |
|---------|--------|
| Kenya Data Protection Act 2019 | ✓ Compliant |
| GDPR (for EU users) | ✓ Compliant |
| PCI-DSS (payments via Paystack) | ✓ Compliant (handled by Paystack) |
| SOC 2 Type II | 🔄 In progress — targeting 12 months post-launch |

---

## Contact

For security questions, vulnerability reports, or compliance requests:
**Email:** security@nexonic.com
**Response time:** Within 24 hours

---

---

# PART 5 — COOKIE POLICY

**Last updated:** March 2026
**Effective date:** March 2026

---

## 1. What Are Cookies

Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences, keep you logged in, and understand how you use the platform. ORCA uses a minimal set of cookies — only what is necessary to operate the platform and understand basic usage patterns.

We do not use advertising cookies. We do not track you across other websites. We do not build advertising profiles.

---

## 2. Cookies ORCA Uses

### 2.1 — Strictly Necessary Cookies

These cookies are required for ORCA to function. Without them, you cannot log in or use the platform. You cannot opt out of these cookies while using ORCA.

| Cookie name | Purpose | Duration | Provider |
|------------|---------|----------|---------|
| `sb-access-token` | Authenticates your session — keeps you logged in | 7 days | Supabase |
| `sb-refresh-token` | Refreshes your session automatically so you stay logged in | 7 days | Supabase |
| `sb-auth-token` | Stores your authentication state between page loads | Session | Supabase |
| `orca-onboarding-step` | Remembers which onboarding step you completed so you can resume | 30 days | ORCA |

### 2.2 — Analytics Cookies

These cookies help us understand how people use ORCA so we can improve the platform. They collect anonymous, aggregated data only — no personally identifiable information is collected or shared.

| Cookie name | Purpose | Duration | Provider |
|------------|---------|----------|---------|
| `va-*` | Vercel Analytics — tracks anonymous page views and navigation paths | 30 days | Vercel |
| `_vercel_analytics_id` | Anonymous visitor identifier for Vercel Analytics | 90 days | Vercel |

**What Vercel Analytics collects:**
- Page views (which pages are visited)
- Navigation paths (how users move through the app)
- Browser and device type (anonymous)
- Country (approximate, not precise location)

**What it does NOT collect:**
- Your name, email, or any personal information
- Exact location or IP address
- Your agent briefs or conversation content
- Any data from inside your dashboard

### 2.3 — Functional Cookies

These cookies remember your preferences and settings to improve your experience. They are not strictly required but make the platform more useful.

| Cookie name | Purpose | Duration | Provider |
|------------|---------|----------|---------|
| `orca-sidebar-state` | Remembers whether your sidebar is expanded or collapsed | 1 year | ORCA |
| `orca-dept-last` | Remembers which department you last had open | 30 days | ORCA |
| `orca-billing-period` | Remembers your preferred billing period (monthly/annual) on the pricing page | 30 days | ORCA |
| `orca-theme` | Stores your display preferences | 1 year | ORCA |

### 2.4 — Cookies We Do NOT Use

ORCA does not use:
- Advertising cookies or tracking pixels
- Cross-site tracking cookies (we don't track you on other websites)
- Social media tracking cookies (Facebook Pixel, Twitter Pixel, etc.)
- Fingerprinting or device identification beyond what is strictly necessary
- Third-party analytics that share data with ad networks

---

## 3. Third-Party Cookies

ORCA embeds no third-party advertising or tracking scripts. The only third-party cookies are from Vercel Analytics (anonymous, aggregated) and Supabase Auth (strictly necessary for login). Neither provider uses your data for advertising.

---

## 4. Managing Cookies

**Browser settings:**
You can manage or delete cookies through your browser settings. Instructions vary by browser:
- Chrome: Settings → Privacy and security → Cookies and other site data
- Firefox: Settings → Privacy & Security → Cookies and Site Data
- Safari: Settings → Privacy → Manage Website Data
- Edge: Settings → Cookies and site permissions → Cookies and site data

**Impact of disabling cookies:**
If you disable the strictly necessary cookies (`sb-access-token`, `sb-refresh-token`), you will not be able to log in to ORCA. Analytics and functional cookies can be disabled without affecting core functionality.

**Opt out of Vercel Analytics:**
Vercel Analytics respects the browser's Do Not Track (DNT) signal. If you have DNT enabled in your browser, Vercel Analytics will not collect data from your session.

---

## 5. Cookie Consent

ORCA's strictly necessary cookies do not require consent as they are essential for the service to function. By using ORCA, you consent to the use of analytics and functional cookies as described in this policy.

You can withdraw consent for non-essential cookies at any time by adjusting your browser settings as described above.

---

## 6. Changes to This Policy

We may update this Cookie Policy when we add new features or change our analytics setup. We will update the "Last updated" date at the top of this page and notify you of material changes via email or in-app notification.

---

## 7. Contact

For questions about cookies or this policy:
**Email:** privacy@nexonic.com
**Website:** nexonic-industries.vercel.app

---

# PART 6 — INTEGRATIONS PAGE

---

## ORCA Integrations

ORCA connects with the tools your company already uses. When an integration is connected, your agents can execute real actions — not just suggest them. Every integration is encrypted, scoped to the minimum permissions required, and can be disconnected at any time.

**How integrations work:**
1. Go to Dashboard → Integrations
2. Find the service you want to connect
3. Click Connect and complete the OAuth flow or enter your API key
4. Your agent gains the ability to act on that service
5. All actions still require your approval if you're on Approve First mode

**Important:** If an integration is not connected, your agents will still suggest what to do — they just won't be able to execute it automatically. You can always connect integrations later without losing any prior work.

---

## 📣 Marketing Integrations

| Service | What agents use it for | Auth method | Connected agents |
|---------|----------------------|-------------|-----------------|
| **LinkedIn** | Aria publishes posts, schedules content, tracks engagement | OAuth | Aria, Mark |
| **X / Twitter** | Aria posts to X, schedules tweets, monitors mentions | OAuth | Aria |
| **Instagram** | Aria schedules posts, tracks reach and engagement | OAuth (via Meta) | Aria |
| **Facebook Pages** | Aria publishes to your business page | OAuth (via Meta) | Aria |
| **TikTok** | Aria schedules TikTok videos and tracks performance | OAuth | Aria |
| **YouTube** | Aria publishes videos, manages descriptions and tags | OAuth | Aria, Jackie |
| **Mailchimp** | Jackie sends email campaigns and manages subscriber lists | API Key | Jackie |
| **ConvertKit** | Jackie manages email sequences and subscriber segments | API Key | Jackie |
| **Beehiiv** | Jackie publishes newsletters and tracks opens | API Key | Jackie |
| **Buffer** | Aria and Jackie schedule cross-platform social content | OAuth | Aria, Jackie |
| **Hootsuite** | Aria manages multi-platform scheduling | OAuth | Aria |
| **Later** | Aria plans and schedules visual social content | OAuth | Aria |
| **Canva** | Joe and Eric pull brand assets and generate ad creatives | OAuth | Joe, Eric |
| **Figma** | Joe accesses design files for brand consistency checks | OAuth | Joe |
| **Google Analytics** | Lucy tracks website traffic and SEO performance | OAuth | Lucy |
| **Google Search Console** | Lucy monitors rankings and search performance | OAuth | Lucy |
| **Ahrefs** | Lucy runs keyword research and backlink analysis | API Key | Lucy |
| **Semrush** | Lucy runs SEO audits and competitor research | API Key | Lucy, Roman |
| **Webflow** | Lucy and Echo update meta descriptions and page content | API Key | Lucy, Eric |
| **WordPress** | Jackie publishes blog posts directly to WordPress | API Key | Jackie |

**Setup notes:**
- Meta integrations (Instagram, Facebook) are connected through a single Meta Business OAuth flow
- Google integrations (Analytics, Search Console) are connected through a single Google OAuth flow
- Canva and Figma integrations are read-only by default

---

## 💼 Sales & Revenue Integrations

| Service | What agents use it for | Auth method | Connected agents |
|---------|----------------------|-------------|-----------------|
| **HubSpot** | Clara manages contacts, deals, and pipeline stages | OAuth | Clara, Rex |
| **Salesforce** | Clara logs deals, updates CRM records, moves pipeline stages | OAuth | Clara |
| **Pipedrive** | Clara tracks deals and pipeline activity | OAuth | Clara |
| **Close CRM** | Clara manages outreach sequences and deal tracking | API Key | Clara, Chase |
| **Apollo.io** | Rex finds and enriches prospect data | API Key | Rex |
| **Hunter.io** | Rex finds email addresses for outreach | API Key | Rex, Mark |
| **Instantly** | Mark manages cold email campaigns and sequences | API Key | Mark |
| **Lemlist** | Mark sends personalised outreach with dynamic content | API Key | Mark |
| **Gmail** | Mark and Chase send outreach emails directly from your account | OAuth | Mark, Chase |
| **Outlook** | Mark and Chase send emails via Microsoft Outlook | OAuth | Mark, Chase |
| **Calendly** | Rex and Clara book discovery calls directly in outreach | OAuth | Rex, Clara |
| **Google Meet** | Cal and Clara schedule and create meeting links | OAuth | Clara |
| **Zoom** | Cal creates Zoom meetings for sales calls | OAuth | Clara |
| **Stripe** | Bill and Felix read revenue data, create invoices, track payments | Restricted API Key | Bill, Felix, Reid |
| **Lemon Squeezy** | Bill tracks product sales and subscription revenue | API Key | Bill, Felix |
| **Gumroad** | Bill tracks product sales and customer data | API Key | Bill |
| **Notion CRM** | Clara logs deals and tracks pipeline in Notion | OAuth | Clara |

**Setup notes:**
- Stripe integration uses a Restricted API Key — never your full secret key. See the Stripe Bridge section in docs for setup
- CRM integrations (HubSpot, Salesforce, Pipedrive) are mutually exclusive — connect the one your team uses

---

## 🤝 Customer Success Integrations

| Service | What agents use it for | Auth method | Connected agents |
|---------|----------------------|-------------|-----------------|
| **Intercom** | Purity reads and responds to support conversations | OAuth | Purity |
| **Crisp** | Purity manages live chat and support tickets | API Key | Purity |
| **Zendesk** | Purity handles support tickets and FAQ updates | OAuth | Purity |
| **Freshdesk** | Purity manages support tickets and responses | API Key | Purity |
| **Help Scout** | Purity manages shared inbox and customer emails | OAuth | Purity |
| **Typeform** | John sends NPS surveys and collects customer feedback | API Key | John |
| **Tally** | John creates and sends feedback forms | API Key | John |
| **Google Forms** | John collects NPS and customer satisfaction data | OAuth | John |
| **Loom** | Bruce creates onboarding video walkthroughs | OAuth | Bruce |
| **Notion** | Dean and Bruce create onboarding docs and customer wikis | OAuth | Bruce, Dean |
| **Slack** | Purity and Beatrice send customer health alerts to your team | OAuth | Purity, Beatrice |
| **WhatsApp Business** | Purity manages customer messages via WhatsApp Business API | API Key | Purity |
| **Mailchimp** | Bruce sends onboarding email sequences | API Key | Bruce |

---

## 🛡️ Tech & Security Integrations

| Service | What agents use it for | Auth method | Connected agents |
|---------|----------------------|-------------|-----------------|
| **GitHub** | Ghost scans repos, Cipher reviews PRs, Wren manages deployments, Hex updates docs | OAuth | Ghost, Cipher, Wren, Hex, Volt |
| **GitLab** | Same as GitHub but for GitLab repositories | OAuth | Ghost, Cipher, Wren, Hex |
| **Bitbucket** | Code scanning and PR reviews for Bitbucket repos | OAuth | Ghost, Cipher |
| **Linear** | Atlas and Wren create and update engineering tasks | OAuth | Wren, Atlas |
| **Jira** | Wren manages sprint tasks and bug reports | OAuth | Wren |
| **Vercel** | Wren triggers deployments and monitors build status | API Key | Wren |
| **Netlify** | Wren manages Netlify deployments | API Key | Wren |
| **Railway** | Wren deploys and monitors Railway services | API Key | Wren |
| **Render** | Wren manages Render deployments | API Key | Wren |
| **AWS** | Wren monitors AWS services and triggers deployments | IAM API Key | Wren |
| **Sentry** | Volt monitors errors and incidents | API Key | Volt |
| **Datadog** | Volt monitors uptime and performance metrics | API Key | Volt |
| **PagerDuty** | Volt triggers and manages incident alerts | API Key | Volt |
| **Cloudflare** | Volt monitors DNS and security events | API Key | Volt, Ghost |
| **Supabase** | Wren monitors database health and runs migrations | API Key | Wren |
| **Firebase** | Wren monitors Firebase services | OAuth | Wren |
| **Docker Hub** | Wren pulls and monitors container images | API Key | Wren |
| **Postman** | Hex documents and tests API endpoints | API Key | Hex |

**Setup notes:**
- GitHub OAuth is the most commonly connected integration in Tech & Security — it powers Ghost (CyberGuard scanning), Cipher (PR reviews), Wren (deployments), Hex (docs), and Volt (incident detection) all from a single connection
- AWS integration requires creating an IAM user with minimum required permissions — see the GitHub Setup docs for the pattern

---

## 🧠 People & Hiring Integrations

| Service | What agents use it for | Auth method | Connected agents |
|---------|----------------------|-------------|-----------------|
| **LinkedIn** | Marcus sources candidates and sends connection requests | OAuth | Marcus |
| **Indeed** | Marcus searches for candidates and posts jobs | API Key | Marcus |
| **Wellfound (AngelList)** | Marcus sources startup-focused talent | OAuth | Marcus |
| **Workable** | Marcus and Vera manage applicants in Workable ATS | API Key | Marcus, Vera |
| **Greenhouse** | Vera manages candidate pipeline in Greenhouse | API Key | Vera |
| **Lever** | Vera tracks candidates through the hiring pipeline | API Key | Vera |
| **Google Meet** | Eli schedules candidate interviews | OAuth | Eli |
| **Zoom** | Eli creates interview meeting links | OAuth | Eli |
| **Calendly** | Eli manages interview scheduling | OAuth | Eli |
| **Slack** | Nina sends new hire announcements and culture updates | OAuth | Nina |
| **Notion** | Nina and Dean create onboarding wikis and first-week plans | OAuth | Nina, Eli |
| **Typeform** | Nina collects culture fit assessment responses | API Key | Nina |
| **Loom** | Nina creates video onboarding guides | OAuth | Nina |
| **BambooHR** | Eli manages offer letters and employee records | API Key | Eli |

**Setup notes:**
- LinkedIn integration for Marcus requires LinkedIn Recruiter Lite or higher for full candidate sourcing
- The Summit (Nexonic ecosystem) is automatically available on Pro+ plans and does not require a separate integration — Marcus queries it natively

---

## 📋 Operations Integrations

| Service | What agents use it for | Auth method | Connected agents |
|---------|----------------------|-------------|-----------------|
| **Notion** | Dean creates and updates internal docs, wikis, and SOPs | OAuth | Dean |
| **Google Calendar** | Cal schedules meetings, blocks focus time, creates events | OAuth | Cal |
| **Google Drive** | Dean stores documents and accesses uploaded files | OAuth | Dean |
| **Google Docs** | Dean creates and updates meeting notes and documents | OAuth | Dean |
| **Google Sheets** | Owen tracks tasks and operational data in spreadsheets | OAuth | Owen, Felix |
| **Slack** | Iris triages Slack messages and sends team notifications | OAuth | Iris, Owen |
| **Microsoft Teams** | Iris manages Teams messages and meeting scheduling | OAuth | Iris, Cal |
| **Linear** | Atlas creates and updates engineering and ops tasks | OAuth | Atlas |
| **Asana** | Atlas manages projects and task assignments | OAuth | Atlas |
| **Monday.com** | Atlas tracks project status and team tasks | OAuth | Atlas |
| **Trello** | Atlas manages kanban boards and task cards | OAuth | Atlas |
| **ClickUp** | Atlas manages tasks, projects, and docs in ClickUp | OAuth | Atlas |
| **Airtable** | Owen manages structured operational data | OAuth | Owen |
| **Zapier** | Owen creates automated workflows between tools | API Key | Owen |
| **Make (Integromat)** | Owen builds complex automation workflows | API Key | Owen |
| **Loom** | Dean creates async video updates and documentation | OAuth | Dean |
| **Dropbox** | Dean stores and accesses operational files | OAuth | Dean |
| **Box** | Dean manages enterprise file storage | OAuth | Dean |
| **Gmail** | Iris triages and drafts email responses | OAuth | Iris |
| **Outlook** | Iris manages Outlook inbox and drafts replies | OAuth | Iris |

---

## 📊 Finance & Legal Integrations

| Service | What agents use it for | Auth method | Connected agents |
|---------|----------------------|-------------|-----------------|
| **Stripe** | Bill creates invoices, Felix tracks revenue, Reid forecasts | Restricted API Key | Bill, Felix, Reid |
| **PayPal** | Bill tracks PayPal payments and transaction history | OAuth | Bill, Felix |
| **Lemon Squeezy** | Bill tracks product revenue and subscription data | API Key | Bill |
| **QuickBooks** | Felix reconciles expenses and generates financial reports | OAuth | Felix, Cora |
| **Wave** | Felix tracks expenses and manages invoicing for small orgs | OAuth | Felix, Bill |
| **Xero** | Felix manages accounting and expense reconciliation | OAuth | Felix, Cora |
| **FreshBooks** | Bill manages invoices and time tracking | OAuth | Bill |
| **Wise** | Felix tracks international payments and FX conversions | API Key | Felix |
| **Mercury** | Felix monitors business bank account activity | API Key | Felix, Reid |
| **Brex** | Felix tracks corporate card spending | API Key | Felix, Reid |
| **DocuSign** | Lena sends contracts for signature | OAuth | Lena |
| **PandaDoc** | Lena creates, sends, and tracks contract signatures | API Key | Lena |
| **HelloSign** | Lena manages document signing workflows | OAuth | Lena |
| **Notion** | Lena stores contract templates and legal documents | OAuth | Lena, Dean |
| **Google Sheets** | Cora exports financial data and budget models | OAuth | Cora, Reid |

**Setup notes:**
- Stripe integration uses a Restricted API Key. Never use your full secret key. Create a restricted key in Stripe Dashboard → Developers → API Keys with read-only permissions for Invoices, Customers, and Subscriptions
- Accounting integrations (QuickBooks, Xero, Wave) are mutually exclusive — connect the one your accountant uses

---

## 🔍 Intelligence & Research Integrations

| Service | What agents use it for | Auth method | Connected agents |
|---------|----------------------|-------------|-----------------|
| **Perplexity AI** | Roman runs deep research queries with real-time web access | API Key | Roman |
| **Notion** | Nate stores intelligence reports and research summaries | OAuth | Nate, Roman |
| **Airtable** | Roman organises structured research data | OAuth | Roman |
| **Google Sheets** | Roman and Nate export research and signal data | OAuth | Roman, Nate |
| **RSS Feeds** | Sage monitors industry publications and competitor blogs | Custom URL | Sage |
| **Feedly** | Sage manages and monitors curated RSS feeds | OAuth | Sage |
| **Exploding Topics** | Dex identifies emerging trends and growth signals | API Key | Dex |
| **SimilarWeb** | Roman analyses competitor web traffic | API Key | Roman |
| **Semrush** | Roman tracks competitor SEO and market positioning | API Key | Roman, Lucy |
| **Crunchbase** | Roman researches funding rounds and company data | API Key | Roman |
| **LinkedIn** | Sage monitors company and competitor activity | OAuth | Sage |
| **X / Twitter** | Sage monitors brand mentions and industry conversations | OAuth | Sage |
| **Reddit** | Sage monitors relevant subreddits for market signals | OAuth | Sage |
| **Product Hunt** | Dex tracks new product launches and market trends | API Key | Dex |

---

## 🌐 Community & Growth Integrations

| Service | What agents use it for | Auth method | Connected agents |
|---------|----------------------|-------------|-----------------|
| **Discord** | Milo moderates the community, posts announcements, manages members | OAuth | Milo |
| **Circle** | Milo manages Circle community spaces and member posts | API Key | Milo |
| **Slack** | Milo manages community Slack workspaces | OAuth | Milo |
| **X / Twitter** | Kai amplifies brand content and monitors mentions | OAuth | Kai, Zoe |
| **LinkedIn** | Rio reaches out to partnership prospects, Zoe contacts influencers | OAuth | Rio, Zoe |
| **Instagram** | Zoe manages influencer outreach and campaign tracking | OAuth | Zoe, Kai |
| **TikTok** | Zoe identifies TikTok influencers for campaigns | OAuth | Zoe |
| **YouTube** | Kai manages video content strategy and channel growth | OAuth | Kai |
| **Beehiiv** | Kai manages newsletter partnerships and sponsor outreach | API Key | Kai |
| **Substack** | Kai tracks newsletter partnerships and growth | API Key | Kai |
| **Product Hunt** | Spike tracks launch performance and community engagement | API Key | Spike |
| **Reddit** | Milo monitors relevant communities for brand mentions | OAuth | Milo, Sage |
| **Luma** | Milo creates and manages community events | API Key | Milo |
| **Eventbrite** | Milo manages event listings and RSVPs | OAuth | Milo |
| **Typeform** | Milo collects community feedback and member surveys | API Key | Milo |
| **Tally** | Milo creates community signup and feedback forms | API Key | Milo |

---

## Connecting an Integration

**OAuth integrations:**
1. Go to Dashboard → Integrations
2. Find the service and click Connect
3. You'll be redirected to that service's authorization page
4. Grant ORCA the requested permissions (always minimum required)
5. You're redirected back to ORCA — the integration is live

**API Key integrations:**
1. Go to Dashboard → Integrations
2. Find the service and click Connect
3. You'll see an input field for your API key
4. Paste your API key and click Save
5. ORCA verifies the key is valid before saving

**Security:**
All OAuth tokens and API keys are encrypted using AES-256-GCM before being stored. The raw credentials are never stored in plaintext and never returned to the browser. See the Security page for full details.

---

## Disconnecting an Integration

1. Go to Dashboard → Integrations
2. Find the connected service
3. Click Disconnect
4. ORCA will revoke its access and delete the stored credentials

Disconnecting an integration does not delete any data that was previously created through ORCA. It only removes ORCA's ability to act on that service going forward.

---

## Requesting a New Integration

Don't see an integration you need? Email integrations@nexonic.com with the service name and how you'd use it. We prioritise integration requests based on demand.

Enterprise customers can use the Custom API to build integrations with any service not on this list.

---

*Nexonic Industries · nexonic-industries.vercel.app*
*© 2026 Nexonic Industries. All rights reserved.*