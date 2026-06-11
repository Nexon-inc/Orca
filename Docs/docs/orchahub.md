Update the following pages with the new features and information described below. Do not change any existing design, layout, colors, fonts, or component structure unless explicitly told to. Only update content, add new sections, and wire in new functionality.

1. LANDING PAGE UPDATES
Hero section
No changes needed — hero copy is correct as is.
Features section — add two new feature cards alongside existing ones:
Card: Bring Your Own LLM
Icon: ⚡
Title: Your Models. Your Control.
Body: Run any agent on any LLM. Connect your own OpenAI, Anthropic, Claude, Mistral, or Groq keys. Assign models at the org, department, or agent level. ORCA works with whatever you already pay for.
Badge: Pro+
Card: OrcaHub Templates
Icon: 🏪
Title: Start in 1 Click.
Body: Browse pre-built company templates — SaaS Startup, Content Marketing Agency, Dev Agency, E-commerce Operator and more. Install a full department structure and Day 1 agent briefs in seconds.
Badge: All plans

Departments section — no changes to the 9 department cards.
How it works section — add a Step 0 before the existing Step 1:
Step 0 — Pick a template (optional)
"Choose from OrcaHub's pre-built company templates. Your departments, agent modes, and Day 1 briefs are configured automatically. Skip straight to your first brief."
Keep existing Steps 1–4 unchanged.

New section — insert between Pricing and the final CTA:
Section heading: "Your models. Your rules."
Subheading: "ORCA works with the LLM you already use."
Show a provider grid — 6 cards in 2 rows of 3:

Google Gemini — Default · All plans
Groq — Default · All plans
OpenAI GPT-4o — Bring your own key · Pro+
Anthropic Claude — Bring your own key · Pro+
Mistral AI — EU data residency · Pro+
Ollama — Self-hosted · Enterprise

Each card: provider logo placeholder (use the provider name as text if no logo), model name, "Default" or "Bring your own key" label, plan badge.
Body below grid:
"By default, ORCA powers all 45 agents using its own Gemini and Groq keys — zero setup. On Pro and Enterprise, connect your own API keys and assign different models to different departments or individual agents."

Pricing section — add one line under each plan's feature list:

Starter: Add ✓ Connect your own LLM keys (Gemini, Groq)
Pro: Add ✓ Connect any LLM (OpenAI, Anthropic, Mistral, Gemini, Groq) and ✓ OrcaHub template marketplace
Enterprise: Add ✓ Ollama self-hosted models and ✓ Publish community templates to OrcaHub


2. ONBOARDING FLOW UPDATES
Step 2 — Build your org chart
After the user completes Step 1 (company name, mission, brand voice, ICP), before showing the department grid, show a template suggestion banner:
Banner design:

Yellow-green tint background: rgba(0,255,135,0.06)
Border: 1px solid rgba(0,255,135,0.2)
Icon: 🏪
Heading: "We found a template for you"
Body: Based on what the user entered in Step 1, show the most relevant template name e.g. "The SaaS Startup template matches your company stage. It activates Marketing, Sales, Tech, and Ops with recommended agent modes and Day 1 briefs ready to go."
Two buttons: "Use this template →" (primary green) and "Build manually" (secondary)

If the user clicks "Use this template":

Skip the manual department selection grid
Show a confirmation: "SaaS Startup template applied. 4 departments activated. 4 Day 1 briefs are ready to send after onboarding."
Proceed to Step 3 (operating mode) — but grey it out with a note: "Template sets recommended modes. You can change these anytime in Account Settings."

If the user clicks "Build manually":

Hide the banner and show the normal department selection grid as before

Template matching logic (based on Step 1 answers):

Industry = SaaS + Stage = early_revenue or growth → SaaS Startup template
Industry = Agency or Consulting → Content Marketing Agency template
Industry = E-commerce → E-commerce Operator template
Industry = Technology + mission mentions "hire" or "talent" → Recruiting Firm template
Industry = Technology + mission mentions "build" or "develop" → Dev Agency template
Everything else → show all templates as options in a small grid


Step 3 — Set operating mode
If a template was applied, show this note at the top of the step:
"The [Template Name] template recommends these modes. You can override any of them."
Show the department rows pre-filled with the template's recommended modes but still editable.

After Step 5 — First brief sent
After the first agent brief is sent and the dashboard loads, if a template was installed, show a "Day 1 Briefs" banner on the Command Center:
Banner design:

Same green tint as standard ORCA cards
Icon: 🏪
Heading: "Your [Template Name] template is live"
Body: "X agents have Day 1 briefs ready. Send them to activate your full company setup."
Button: "Send all briefs →" (opens a modal showing each brief with Send / Skip per agent)
Dismiss button (X) top right


3. PRICING PAGE UPDATES
Billing toggle
No changes.
Plan cards — update feature lists
Starter — $99/mo
Add after existing features:

✓ ORCA-powered AI (Gemini + Groq)
✓ OrcaHub templates (free tier)
✓ Bring your own Gemini or Groq key

Pro — $199/mo ⭐
Add after existing features:

✓ Bring your own LLM (OpenAI, Anthropic, Mistral, Gemini, Groq)
✓ Per-department and per-agent model assignment
✓ Full OrcaHub marketplace

Enterprise — $399/mo
Add after existing features:

✓ Ollama self-hosted model support
✓ Publish templates to OrcaHub community
✓ Custom model fine-tuning (coming soon)


Add new section below pricing cards — "OrcaHub"
Heading: "Start with a template. Ship faster."
Body: "Browse pre-built company structures and import them in one click. Every template includes department configurations, recommended agent operating modes, and Day 1 briefs to get your agents working immediately."
Show 6 template cards in a 3-column grid:
TemplateCategoryAgentsPlan🚀 SaaS StartupStartup4 depts · 16 agentsFree📣 Content Marketing AgencyMarketing4 depts · 18 agentsStarter🛒 E-commerce OperatorE-commerce4 depts · 19 agentsStarter💼 Recruiting FirmHiring4 depts · 17 agentsPro🛠️ Dev AgencyTechnology4 depts · 19 agentsPro🔍 Intelligence & Research DeskResearch3 depts · 15 agentsPro
Each card: emoji + name, category tag, agent/dept count, plan badge, "Preview →" link.
At the bottom: "Browse all templates in OrcaHub →" link.

4. DASHBOARD UPDATES
4a. Sidebar — add OrcaHub nav item (Owner/Cofounder only)
In the Owner sidebar, add under Integrations and above Account:
🏪  OrcaHub
Same styling as other nav items. Navigates to /dashboard/orcahub.

4b. New page — OrcaHub (/dashboard/orcahub)
Full page. Owner and Cofounder only.
Header:
Title: OrcaHub (Syne 800, 20px)
Subtitle: Pre-built company templates. Install and go.
Search input (right side): Search templates...
Filter row:
Category pills — All · Startup · Marketing · E-commerce · Hiring · Technology · Research
Plan filter — All plans · Free · Starter · Pro · Enterprise
Template grid (3 columns):
Each template card:

Preview image placeholder (dark card with emoji centered, 200px height)
Template name (Syne 700, 14px)
Category tag + plan badge
Agent/dept count (e.g. "4 departments · 16 agents")
One-line description
Install count ("247 installs" — small, muted)
"Install →" button (primary green on hover, secondary by default)
If already installed: show "✓ Installed" badge (green, disabled button)

Template detail modal (opens on card click):

Template name + category
Full description
Departments list with operating modes
Day 1 briefs preview (show first 2 briefs, "Show all" toggle)
Suggested integrations as pill tags
Plan requirement
"Install Template →" button (primary green)
Cancel

After install — success state:
Modal updates to:

"✓ [Template Name] installed"
"X departments activated · Y Day 1 briefs ready"
"View Day 1 Briefs →" button that opens the briefs panel
"Close" button


4c. New page — Day 1 Briefs panel (/dashboard/orcahub/briefs)
Or accessible as a slide-over panel from the Command Center banner.
Header: "Day 1 Briefs" — (Syne 700) — "from [Template Name]"
Brief cards (one per agent):

Agent icon + name + role
Brief text (the pre-written brief, editable before sending)
Rationale (italic, muted) — "Why this brief matters on Day 1"
Two buttons: "Send →" (primary) and "Skip" (secondary)
If sent: shows "✓ Sent" green badge, button disabled

Bottom action row:
"Send all remaining" (primary) · "Dismiss all" (secondary, danger-tinted)

4d. Account Settings — new AI Models tab (Owner/Cofounder, Pro+)
Add a new tab between Integrations and Billing: AI Models
Tab content:
Section 1 — Default Model (org-level)
Heading: "Default AI Model"
Body: "All agents use this model unless overridden below."
Two columns:

Provider dropdown: Google Gemini · Groq · OpenAI · Anthropic · Mistral · Ollama
Model dropdown: updates based on provider selection

Toggle: "Use ORCA's key" (default, green) / "Use my own key"
If "Use my own key" selected: show API key input + "Validate key" button
Validation feedback: green checkmark if valid, red error if not
Save button.

Section 2 — Department Overrides
Heading: "Department model overrides"
Body: "Override the default model for specific departments."
9 rows, one per department:

Dept icon + name
Status: "Inheriting org default (Gemini 1.5 Pro)" in muted text
"Override" button → expands row to show provider + model dropdowns + optional API key


Section 3 — Agent Overrides
Heading: "Agent model overrides"
Body: "Override for a specific agent."
Collapsible per department. Same override pattern as department rows but per agent name.

Section 4 — Cost Estimate
Heading: "Estimated monthly AI cost"
Body: Live estimate based on usage + selected models.
Simple table:

Current usage: X briefs/month (from last 30 days)
Selected model cost per 1K tokens
Estimated monthly cost: $X.XX
Note: "Costs only apply to keys you provide. ORCA's default keys are included in your plan."


4e. Agent hero — model badge
When a custom LLM is active for an agent, show a small badge in the agent hero meta row:
Default: no badge shown
Custom: small pill → ⚡ GPT-4o or ⚡ Claude or ⚡ Mistral
Color: white border, muted text (same style as other meta badges)
Tooltip on hover: "This agent is using your custom [Provider] key"

5. ENV VARS TO ADD
Tell Antigravity to add these to .env.local and Vercel — leave values blank for now, just add the keys:
env# BYOLLM — user-provided keys (validated + encrypted before saving)
# These are set per-org in the DB, not globally
# No env vars needed for user keys — they're stored encrypted in llm_configs table

# OrcaHub — no additional env vars needed
# Templates are seeded directly into the orcahub_templates table
No new env vars required for either feature — BYOLLM keys are stored encrypted per org in the database, and OrcaHub is database-driven.

6. DATABASE MIGRATIONS TO RUN
Tell Antigravity to run these migrations in Supabase before connecting the frontend:

llm_configs table — see backend.md Section 16.1
orcahub_templates table — see backend.md Section 17.3
orcahub_installs table — see backend.md Section 17.3
pending_briefs table — see backend.md Section 17.6
increment_template_installs SQL function — see backend.md Section 17.9
Seed all 6 official templates into orcahub_templates


7. REFERENCE FILES

backend.md — Section 16 (BYOLLM full implementation) and Section 17 (OrcaHub full implementation)
frontned for all 45 agents, icons, roles, quick prompts,  integrations list, pricing content, docs content