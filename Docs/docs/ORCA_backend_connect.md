# ORCA — Backend Connection Implementation
## backend_connect.md · Priority build order to make the dashboard fully live
### Covers all 4 gaps identified in backend_analysis.md + Gmail SMTP already connected

---

## STATUS SUMMARY

| Item | Status |
|------|--------|
| Frontend mocks removed | ✅ Done |
| Gmail SMTP connected | ✅ Done |
| Database tables exist | ✅ Done |
| Auto-seed on signup | ❌ Build now |
| `/api/org/stats` | ❌ Build now |
| `/api/org/activity` | ❌ Build now |
| `/api/org/coordination` | ❌ Build now |
| `/api/orcahub` (GET list) | ❌ Build now |
| Onboarding → company_identity | ❌ Build now |
| Supabase Realtime subscriptions | ❌ Build now |

**Build order matters. Do Step 1 first — everything else depends on it.**

---

## STEP 1 — AUTO-SEED ON SIGNUP (The Foundation)

This is the most critical fix. Without it every new user gets a blank dashboard.

The seed must run immediately after `organizations` is created — before the user
even finishes onboarding. It inserts all 9 departments and all 45 agents linked
to the new `org_id`.

### 1a — Agent seed data (all 45 agents)

```typescript
// lib/seed/agentData.ts
// Single source of truth for all 45 agents — used by the seed function

export const AGENT_SEED_DATA = [
  // ── MARKETING ──────────────────────────────────────────────
  { dept: 'marketing', name: 'Aria',   icon: '🎙️', acronym: 'AR', role: 'Social Media Manager' },
  { dept: 'marketing', name: 'Jackie', icon: '✍️', acronym: 'JK', role: 'Content Writer' },
  { dept: 'marketing', name: 'Eric',   icon: '📢', acronym: 'ER', role: 'Ads Manager' },
  { dept: 'marketing', name: 'Lucy',   icon: '🔍', acronym: 'LC', role: 'SEO Specialist' },
  { dept: 'marketing', name: 'Joe',    icon: '🎨', acronym: 'JO', role: 'Brand Voice' },

  // ── SALES & REVENUE ────────────────────────────────────────
  { dept: 'sales', name: 'Rex',   icon: '💰', acronym: 'RX', role: 'Lead Prospector' },
  { dept: 'sales', name: 'Clara', icon: '📋', acronym: 'CL', role: 'CRM Manager' },
  { dept: 'sales', name: 'Chase', icon: '🏃', acronym: 'CH', role: 'Follow-up Agent' },
  { dept: 'sales', name: 'Mark',  icon: '📬', acronym: 'MK', role: 'Outreach Agent' },
  { dept: 'sales', name: 'Teo',   icon: '🔭', acronym: 'TE', role: 'Sales Intel' },

  // ── CUSTOMER SUCCESS ───────────────────────────────────────
  { dept: 'cs', name: 'Purity',   icon: '🛟', acronym: 'PU', role: 'Support Agent' },
  { dept: 'cs', name: 'Bruce',    icon: '🧭', acronym: 'BR', role: 'Onboarding Agent' },
  { dept: 'cs', name: 'Nadia',    icon: '🔗', acronym: 'ND', role: 'Retention Agent' },
  { dept: 'cs', name: 'John',     icon: '📊', acronym: 'JN', role: 'NPS Agent' },
  { dept: 'cs', name: 'Beatrice', icon: '💚', acronym: 'BE', role: 'Customer Health' },

  // ── TECH & SECURITY ────────────────────────────────────────
  { dept: 'tech', name: 'Ghost',  icon: '👻', acronym: 'GH', role: 'Security Scanner (CyberGuard)' },
  { dept: 'tech', name: 'Cipher', icon: '🔐', acronym: 'CP', role: 'Code Reviewer' },
  { dept: 'tech', name: 'Wren',   icon: '⚙️', acronym: 'WR', role: 'DevOps Agent' },
  { dept: 'tech', name: 'Hex',    icon: '📖', acronym: 'HX', role: 'Docs Agent' },
  { dept: 'tech', name: 'Volt',   icon: '⚡', acronym: 'VT', role: 'Incident Response' },

  // ── PEOPLE & HIRING ────────────────────────────────────────
  { dept: 'hiring', name: 'Marcus', icon: '🔎', acronym: 'MC', role: 'Talent Sourcer' },
  { dept: 'hiring', name: 'Vera',   icon: '🧬', acronym: 'VR', role: 'Candidate Screener' },
  { dept: 'hiring', name: 'Zara',   icon: '✅', acronym: 'ZR', role: 'Verification Agent' },
  { dept: 'hiring', name: 'Eli',    icon: '📝', acronym: 'EL', role: 'Offer Coordinator' },
  { dept: 'hiring', name: 'Nina',   icon: '🌱', acronym: 'NI', role: 'Culture & Onboarding' },

  // ── OPERATIONS ─────────────────────────────────────────────
  { dept: 'ops', name: 'Atlas', icon: '🗺️', acronym: 'AT', role: 'Project Manager' },
  { dept: 'ops', name: 'Cal',   icon: '📅', acronym: 'CA', role: 'Calendar Agent' },
  { dept: 'ops', name: 'Dean',  icon: '🗒️', acronym: 'DN', role: 'Notes & Docs Agent' },
  { dept: 'ops', name: 'Iris',  icon: '📥', acronym: 'IR', role: 'Inbox Agent' },
  { dept: 'ops', name: 'Owen',  icon: '🔄', acronym: 'OW', role: 'Task Coordinator' },

  // ── FINANCE & LEGAL ────────────────────────────────────────
  { dept: 'finance', name: 'Bill',   icon: '🧾', acronym: 'BL', role: 'Invoicing Agent' },
  { dept: 'finance', name: 'Felix',  icon: '💳', acronym: 'FX', role: 'Expense Tracker' },
  { dept: 'finance', name: 'Lena',   icon: '⚖️', acronym: 'LN', role: 'Contract Agent' },
  { dept: 'finance', name: 'Reid',   icon: '📐', acronym: 'RD', role: 'Budget Agent' },
  { dept: 'finance', name: 'Cora',   icon: '🔬', acronym: 'CO', role: 'Financial Review' },

  // ── INTELLIGENCE & RESEARCH ────────────────────────────────
  { dept: 'intel', name: 'Roman',    icon: '🏛️', acronym: 'RM', role: 'Research Agent' },
  { dept: 'intel', name: 'Sage',     icon: '📡', acronym: 'SG', role: 'Market Listener' },
  { dept: 'intel', name: 'Nate',     icon: '📰', acronym: 'NT', role: 'Summary Agent' },
  { dept: 'intel', name: 'Ada',      icon: '🔮', acronym: 'AD', role: 'Forecasting Agent' },
  { dept: 'intel', name: 'Dex',      icon: '📈', acronym: 'DX', role: 'Trend Analyst' },

  // ── COMMUNITY & GROWTH ─────────────────────────────────────
  { dept: 'community', name: 'Spike', icon: '🚀', acronym: 'SP', role: 'Growth Agent' },
  { dept: 'community', name: 'Milo',  icon: '🎵', acronym: 'ML', role: 'Community Manager' },
  { dept: 'community', name: 'Rio',   icon: '🤝', acronym: 'RI', role: 'Partnership Agent' },
  { dept: 'community', name: 'Zoe',   icon: '🌟', acronym: 'ZO', role: 'Influencer Agent' },
  { dept: 'community', name: 'Kai',   icon: '🔊', acronym: 'KI', role: 'Brand Amplifier' },
]

export const DEPARTMENT_SEED_DATA = [
  { key: 'marketing', name: 'Marketing',            icon: '📣' },
  { key: 'sales',     name: 'Sales & Revenue',      icon: '💼' },
  { key: 'cs',        name: 'Customer Success',     icon: '🤝' },
  { key: 'tech',      name: 'Tech & Security',      icon: '🛡️' },
  { key: 'hiring',    name: 'People & Hiring',      icon: '🧠' },
  { key: 'ops',       name: 'Operations',           icon: '📋' },
  { key: 'finance',   name: 'Finance & Legal',      icon: '📊' },
  { key: 'intel',     name: 'Intelligence & Research', icon: '🔍' },
  { key: 'community', name: 'Community & Growth',   icon: '🌐' },
]
```

### 1b — Seed function

```typescript
// lib/seed/seedOrg.ts
// Call this immediately after creating an org — seeds all 9 depts + 45 agents

import { createClient } from '@supabase/supabase-js'
import { DEPARTMENT_SEED_DATA, AGENT_SEED_DATA } from './agentData'

export async function seedNewOrg(orgId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // service role — bypasses RLS for seeding
  )

  // 1. Insert all 9 departments
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .insert(
      DEPARTMENT_SEED_DATA.map(dept => ({
        org_id: orgId,
        key: dept.key,
        name: dept.name,
        icon: dept.icon,
        agent_mode: 'approve_first', // safe default for every new org
        agents_paused: false,
      }))
    )
    .select('id, key')

  if (deptError) {
    console.error('Department seed failed:', deptError)
    throw deptError
  }

  // Build a map: dept key → dept id
  const deptMap = Object.fromEntries(
    (departments || []).map(d => [d.key, d.id])
  )

  // 2. Insert all 45 agents linked to their departments
  const agentRows = AGENT_SEED_DATA.map(agent => ({
    department_id: deptMap[agent.dept],
    name: agent.name,
    icon: agent.icon,
    acronym: agent.acronym,
    role_description: agent.role,
    status: 'idle',
    tasks_today: 0,
  }))

  const { error: agentError } = await supabase
    .from('agents')
    .insert(agentRows)

  if (agentError) {
    console.error('Agent seed failed:', agentError)
    throw agentError
  }

  return { departments_seeded: 9, agents_seeded: 45 }
}
```

### 1c — Call seedNewOrg from signup route

```typescript
// app/api/auth/signup/route.ts — add after creating org and org_member
import { seedNewOrg } from '@/lib/seed/seedOrg'

// After:
// await supabase.from('org_members').insert({ org_id: org.id, user_id: userId, role: 'owner' })
// await supabase.from('company_identity').insert({ org_id: org.id })

// Add this:
await seedNewOrg(org.id)
// ↑ this inserts all 9 departments and 45 agents for this org
// runs silently — does not block the signup response
```

### 1d — Also seed when OrcaHub template installs depts

```typescript
// lib/seed/seedAgentsForDept.ts
// Use this when installing individual depts from OrcaHub templates

import { createClient } from '@supabase/supabase-js'
import { AGENT_SEED_DATA } from './agentData'

export async function seedAgentsForDept(orgId: string, deptKey: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get dept id
  const { data: dept } = await supabase
    .from('departments')
    .select('id')
    .eq('org_id', orgId)
    .eq('key', deptKey)
    .single()

  if (!dept) return

  // Check if agents already seeded (idempotent)
  const { count } = await supabase
    .from('agents')
    .select('id', { count: 'exact', head: true })
    .eq('department_id', dept.id)

  if ((count ?? 0) > 0) return // Already seeded — skip

  const agents = AGENT_SEED_DATA.filter(a => a.dept === deptKey)
  await supabase.from('agents').insert(
    agents.map(a => ({
      department_id: dept.id,
      name: a.name,
      icon: a.icon,
      acronym: a.acronym,
      role_description: a.role,
      status: 'idle',
      tasks_today: 0,
    }))
  )
}
```

---

## STEP 2 — ONBOARDING → COMPANY IDENTITY

All data from the onboarding flow must be saved to `company_identity`.
Currently it's collected but never written to the DB.

### 2a — Save each step as it completes

```typescript
// app/api/onboarding/progress/route.ts
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { step, data } = await request.json()
  const supabase = createServerSupabaseClient()

  // Get org id
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  const orgId = member!.org_id

  // Step 1 — company identity fields
  if (step === 1) {
    await supabase.from('company_identity').upsert({
      org_id: orgId,
      company_name: data.company_name,
      mission: data.mission,
      brand_voice: data.brand_voice,
      icp: data.icp,
      industry: data.industry,
      stage: data.stage,
      geography: data.geography,
      competitors: data.competitors || [],
    }, { onConflict: 'org_id' })

    // Also update org name
    await supabase
      .from('organizations')
      .update({ name: data.company_name })
      .eq('id', orgId)
  }

  // Step 2 — department activation + agent mode
  if (step === 2) {
    // If template was chosen, departments are already seeded
    // If manual, activate selected departments
    if (data.selected_departments && !data.template_slug) {
      for (const deptKey of data.selected_departments) {
        await supabase
          .from('departments')
          .update({ agents_paused: false })
          .eq('org_id', orgId)
          .eq('key', deptKey)
      }
      // Pause departments NOT selected on Free/Starter plans
      await supabase
        .from('departments')
        .update({ agents_paused: true })
        .eq('org_id', orgId)
        .not('key', 'in', `(${data.selected_departments.map((d: string) => `'${d}'`).join(',')})`)
    }
  }

  // Step 3 — operating mode
  if (step === 3) {
    await supabase
      .from('departments')
      .update({ agent_mode: data.agent_mode })
      .eq('org_id', orgId)
      .eq('agents_paused', false)
  }

  // Step 5 — mark onboarding complete
  if (step === 5) {
    await supabase
      .from('organizations')
      .update({
        onboarding_completed: true,
        onboarding_step: 5,
      })
      .eq('id', orgId)
  }

  // Always save current step progress
  await supabase
    .from('organizations')
    .update({ onboarding_step: step + 1 })
    .eq('id', orgId)

  return NextResponse.json({ saved: true, next_step: step + 1 })
}
```

### 2b — GET company identity for Account Settings profile tab

```typescript
// app/api/company/route.ts
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  const { data: identity } = await supabase
    .from('company_identity')
    .select('*')
    .eq('org_id', member!.org_id)
    .single()

  return NextResponse.json({ identity })
}

export async function PUT(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const supabase = createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  if (!['owner', 'cofounder'].includes(member!.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await supabase
    .from('company_identity')
    .upsert({ org_id: member!.org_id, ...body }, { onConflict: 'org_id' })

  return NextResponse.json({ saved: true })
}
```

---

## STEP 3 — THE 4 MISSING API ENDPOINTS

### 3a — `/api/org/stats` — Dashboard stat cards

```typescript
// app/api/org/stats/route.ts
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  const orgId = member!.org_id
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Run all stat queries in parallel
  const [
    tasksResult,
    activeAgentsResult,
    coordResult,
    pipelineResult,
    lastCoordResult,
  ] = await Promise.all([

    // Tasks today — messages sent by agents today
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_type', 'agent')
      .gte('created_at', today.toISOString())
      .in(
        'conversation_id',
        supabase.from('conversations').select('id').eq('org_id', orgId)
      ),

    // Active agents — agents with status 'active' or 'busy'
    supabase
      .from('agents')
      .select('id', { count: 'exact', head: true })
      .in('status', ['active', 'busy'])
      .in(
        'department_id',
        supabase.from('departments').select('id').eq('org_id', orgId)
      ),

    // Coordination events in last 24h
    supabase
      .from('coordination_events')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('created_at', last24h),

    // Pipeline leads — count of approved messages in Sales dept today
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('created_at', today.toISOString())
      .in(
        'conversation_id',
        supabase
          .from('conversations')
          .select('id')
          .eq('org_id', orgId)
          .eq('department_key', 'sales')
      ),

    // Last coordination — for the "Last: X → Y" label
    supabase
      .from('coordination_events')
      .select(`
        id,
        from_agent:agents!from_agent_id(name),
        to_agent:agents!to_agent_id(name)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  const lastCoord = lastCoordResult.data
  const lastCoordLabel = lastCoord
    ? `Last: ${(lastCoord.from_agent as any)?.name} → ${(lastCoord.to_agent as any)?.name}`
    : 'No events yet'

  return NextResponse.json({
    tasks_today: tasksResult.count ?? 0,
    active_agents: activeAgentsResult.count ?? 0,
    pipeline_leads: pipelineResult.count ?? 0,
    coordination_events: coordResult.count ?? 0,
    coordination_label: lastCoordLabel,
  })
}
```

**Frontend connects this to the 4 stat cards on the Command Center.**
Call on page load. Refresh every 60 seconds or on Realtime event.

---

### 3b — `/api/org/activity` — Live activity feed

```typescript
// app/api/org/activity/route.ts
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  const supabase = createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role, department_key')
    .eq('user_id', user.id)
    .single()

  const orgId = member!.org_id

  // Get recent agent messages with agent + dept context
  // For heads/members — scope to their department only
  let convQuery = supabase
    .from('conversations')
    .select('id, department_key')
    .eq('org_id', orgId)

  if (['head', 'member'].includes(member!.role) && member!.department_key) {
    convQuery = convQuery.eq('department_key', member!.department_key)
  }

  const { data: conversations } = await convQuery
  const convIds = (conversations || []).map(c => c.id)

  if (convIds.length === 0) {
    return NextResponse.json({ activity: [] })
  }

  // Get recent agent messages
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      conversation_id,
      conversations!inner(
        department_key,
        agents!inner(
          name,
          icon,
          acronym
        )
      )
    `)
    .eq('sender_type', 'agent')
    .eq('status', 'approved')
    .in('conversation_id', convIds)
    .order('created_at', { ascending: false })
    .limit(limit)

  // Shape the response for the activity feed UI
  const activity = (messages || []).map(msg => {
    const conv = msg.conversations as any
    const agent = conv?.agents
    return {
      id: msg.id,
      agent_name: agent?.name || 'Agent',
      agent_icon: agent?.icon || '⬡',
      agent_acronym: agent?.acronym || '??',
      department: conv?.department_key || 'unknown',
      action: msg.content.slice(0, 120), // truncate for feed display
      created_at: msg.created_at,
      status: 'active',
    }
  })

  return NextResponse.json({ activity })
}
```

**Frontend connects this to the Live Activity Feed at the bottom of Command Center.**

---

### 3c — `/api/org/coordination` — Coordination feed

```typescript
// app/api/org/coordination/route.ts
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 30)

  const supabase = createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single()

  const { data: events } = await supabase
    .from('coordination_events')
    .select(`
      id,
      type,
      description,
      status,
      auto_approved,
      created_at,
      from_agent:agents!from_agent_id(name, icon, acronym),
      to_agent:agents!to_agent_id(name, icon, acronym)
    `)
    .eq('org_id', member!.org_id)
    .order('created_at', { ascending: false })
    .limit(limit)

  // Shape for the coordination feed UI component
  const feed = (events || []).map(e => ({
    id: e.id,
    type: e.type,                           // 'handoff' | 'alert' | 'trigger' | 'brief'
    description: e.description,
    status: e.status,                       // 'pending' | 'approved' | 'complete'
    auto_approved: e.auto_approved,
    created_at: e.created_at,
    from_agent: {
      name: (e.from_agent as any)?.name || 'Unknown',
      icon: (e.from_agent as any)?.icon || '⬡',
    },
    to_agent: {
      name: (e.to_agent as any)?.name || 'Unknown',
      icon: (e.to_agent as any)?.icon || '⬡',
    },
  }))

  return NextResponse.json({ feed })
}
```

**Frontend connects this to the Coordination Feed panel (right column of Command Center).**

---

### 3d — `/api/orcahub` — Template listing (GET)

```typescript
// app/api/orcahub/route.ts
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const plan = searchParams.get('plan')

  const supabase = createServerSupabaseClient()

  // Get user's plan to show what's accessible
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, organizations(plan)')
    .eq('user_id', user.id)
    .single()

  const orgId = member!.org_id
  const orgPlan = (member as any)?.organizations?.plan || 'free'

  // Build templates query
  let query = supabase
    .from('orcahub_templates')
    .select('id, slug, name, description, category, tags, plan_required, installs, preview_image_url, author')
    .eq('published', true)
    .order('installs', { ascending: false }) // most popular first

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  if (plan && plan !== 'all') {
    query = query.eq('plan_required', plan)
  }

  const { data: templates } = await query

  // Get which templates this org has already installed
  const { data: installs } = await supabase
    .from('orcahub_installs')
    .select('template_id')
    .eq('org_id', orgId)

  const installedIds = new Set((installs || []).map(i => i.template_id))

  // Mark plan accessibility and install status
  const PLAN_ORDER = ['free', 'starter', 'pro', 'enterprise']
  const enriched = (templates || []).map(t => ({
    ...t,
    is_installed: installedIds.has(t.id),
    is_accessible: PLAN_ORDER.indexOf(orgPlan) >= PLAN_ORDER.indexOf(t.plan_required),
  }))

  return NextResponse.json({
    templates: enriched,
    org_plan: orgPlan,
  })
}
```

**Frontend connects this to the OrcaHub page template grid.**

---

## STEP 4 — SUPABASE REALTIME SUBSCRIPTIONS

Enable these in Supabase Dashboard first:
Go to **Database → Replication → Supabase Realtime**
Enable for tables: `messages`, `coordination_events`, `approval_requests`, `team_messages`

Then add these hooks to the frontend:

### 4a — Coordination feed live updates

```typescript
// hooks/useRealtimeCoordination.ts
'use client'
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeCoordination(
  orgId: string,
  onNewEvent: (event: any) => void
) {
  const supabase = createClient()
  const callbackRef = useRef(onNewEvent)
  useEffect(() => { callbackRef.current = onNewEvent }, [onNewEvent])

  useEffect(() => {
    if (!orgId) return

    const channel = supabase
      .channel(`coordination:${orgId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'coordination_events',
        filter: `org_id=eq.${orgId}`,
      }, payload => {
        // Fetch the full event with agent names since realtime only sends the row
        callbackRef.current(payload.new)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orgId])
}
```

### 4b — Activity feed live updates

```typescript
// hooks/useRealtimeActivity.ts
'use client'
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeActivity(
  orgId: string,
  onNewMessage: (message: any) => void
) {
  const supabase = createClient()
  const callbackRef = useRef(onNewMessage)
  useEffect(() => { callbackRef.current = onNewMessage }, [onNewMessage])

  useEffect(() => {
    if (!orgId) return

    const channel = supabase
      .channel(`activity:${orgId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_type=eq.agent`,
      }, payload => callbackRef.current(payload.new))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orgId])
}
```

### 4c — Approval badge count live updates

```typescript
// hooks/useRealtimeApprovals.ts
'use client'
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeApprovals(
  orgId: string,
  onNewApproval: (approval: any) => void
) {
  const supabase = createClient()
  const callbackRef = useRef(onNewApproval)
  useEffect(() => { callbackRef.current = onNewApproval }, [onNewApproval])

  useEffect(() => {
    if (!orgId) return

    const channel = supabase
      .channel(`approvals:${orgId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'approval_requests',
        filter: `org_id=eq.${orgId}`,
      }, payload => callbackRef.current(payload.new))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orgId])
}
```

### 4d — Stats auto-refresh when activity happens

```typescript
// hooks/useStatsRefresh.ts
// Refreshes the stat cards whenever a new coordination event or message lands
'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStatsRefresh(orgId: string) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/org/stats')
    const data = await res.json()
    setStats(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStats()

    // Re-fetch stats when new coordination events come in
    const channel = supabase
      .channel(`stats-refresh:${orgId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'coordination_events',
        filter: `org_id=eq.${orgId}`,
      }, () => fetchStats())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, () => fetchStats())
      .subscribe()

    // Also refresh every 60 seconds as a fallback
    const interval = setInterval(fetchStats, 60000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [orgId, fetchStats])

  return { stats, loading, refetch: fetchStats }
}
```

---

## STEP 5 — SEED ORCAHUB TEMPLATES INTO DATABASE

Run this SQL in the Supabase SQL editor to seed all 6 official templates:

```sql
insert into public.orcahub_templates
  (slug, name, description, category, tags, template_data, author, plan_required, installs, published)
values

('saas-startup',
 'SaaS Startup',
 'For solo founders and early-stage SaaS teams. Activates Marketing, Sales, Tech, and Ops with recommended agent modes and Day 1 briefs ready to go.',
 'saas_startup',
 ARRAY['startup','saas','founders'],
 '{
   "departments": [
     {"key":"marketing","agent_mode":"approve_first","priority":"high","description":"Content, social, SEO","active_agents":["Aria","Jackie","Lucy"]},
     {"key":"sales","agent_mode":"approve_first","priority":"high","description":"Leads and outreach","active_agents":["Rex","Clara","Chase"]},
     {"key":"tech","agent_mode":"autopilot","priority":"medium","description":"Code security and DevOps","active_agents":["Ghost","Wren","Hex"]},
     {"key":"ops","agent_mode":"autopilot","priority":"medium","description":"Project management","active_agents":["Atlas","Cal","Dean"]}
   ],
   "suggested_integrations": ["github","notion","slack","google_calendar","linkedin","hubspot"],
   "day1_briefs": [
     {"agent_name":"Aria","brief":"Write 5 LinkedIn posts introducing our product. Founder tone. Include our waitlist link.","rationale":"Aria gets your social presence started immediately with content that attracts your ICP."},
     {"agent_name":"Rex","brief":"Find 20 founders in our ICP who have posted about operational challenges in the last 30 days.","rationale":"Rex builds your first lead pipeline with warm, high-intent prospects."},
     {"agent_name":"Ghost","brief":"Scan our main repository for security vulnerabilities. Report any critical issues immediately.","rationale":"Ghost catches security issues before they become production problems."},
     {"agent_name":"Atlas","brief":"Create a launch week project plan with daily tasks for the next 7 days.","rationale":"Atlas gives structure to your first week so nothing falls through the cracks."}
   ]
 }'::jsonb,
 'orca_official', 'free', 0, true),

('content-marketing-agency',
 'Content Marketing Agency',
 'For agencies running content, SEO, and social for multiple clients. Activates Marketing, Intelligence, Community, and Ops.',
 'marketing_agency',
 ARRAY['agency','marketing','content','seo'],
 '{
   "departments": [
     {"key":"marketing","agent_mode":"approve_first","priority":"high","description":"Content, social, SEO, ads","active_agents":["Aria","Jackie","Eric","Lucy"]},
     {"key":"intel","agent_mode":"autopilot","priority":"medium","description":"Competitor and market research","active_agents":["Roman","Sage","Nate"]},
     {"key":"community","agent_mode":"approve_first","priority":"medium","description":"Partnerships and growth","active_agents":["Milo","Rio","Spike"]},
     {"key":"ops","agent_mode":"autopilot","priority":"low","description":"Project and task management","active_agents":["Atlas","Dean","Iris"]}
   ],
   "suggested_integrations": ["linkedin","twitter","wordpress","google_analytics","ahrefs","notion","slack"],
   "day1_briefs": [
     {"agent_name":"Jackie","brief":"Write a 1,200-word blog post about the top 5 AI tools for small business owners. SEO-optimised, professional tone.","rationale":"Jackie produces your first piece of content immediately — sets the quality bar."},
     {"agent_name":"Lucy","brief":"Run an SEO audit of our main website. Report the top 10 on-page issues to fix this week.","rationale":"Lucy identifies quick wins that improve organic visibility without new content."},
     {"agent_name":"Roman","brief":"Research our top 5 competitors. Summarise their content strategy, publishing frequency, and top performing topics.","rationale":"Roman builds the competitive intelligence your whole team will reference."},
     {"agent_name":"Sage","brief":"Monitor our brand name and top 3 competitors on LinkedIn, X, and Reddit for the next 30 days.","rationale":"Sage keeps you informed of market movements without manual searching."}
   ]
 }'::jsonb,
 'orca_official', 'starter', 0, true),

('ecommerce-operator',
 'E-commerce Operator',
 'For DTC brands and online stores. Activates Marketing, Sales, Customer Success, and Finance with an e-commerce focus.',
 'ecommerce',
 ARRAY['ecommerce','dtc','retail','shopify'],
 '{
   "departments": [
     {"key":"marketing","agent_mode":"approve_first","priority":"high","description":"Ads, social, email","active_agents":["Aria","Eric","Jackie"]},
     {"key":"sales","agent_mode":"autopilot","priority":"high","description":"Lead gen and pipeline","active_agents":["Rex","Clara","Chase"]},
     {"key":"cs","agent_mode":"autopilot","priority":"high","description":"Support and retention","active_agents":["Purity","Bruce","Nadia"]},
     {"key":"finance","agent_mode":"approve_first","priority":"medium","description":"Invoicing and expenses","active_agents":["Bill","Felix","Reid"]}
   ],
   "suggested_integrations": ["meta","mailchimp","stripe_revenue","intercom","google_analytics"],
   "day1_briefs": [
     {"agent_name":"Aria","brief":"Write 5 Instagram captions for our product launch campaign. Bold, energetic tone. Include a call to action.","rationale":"Aria kick-starts your social presence for the launch."},
     {"agent_name":"Eric","brief":"Write 3 Facebook ad copy variants for our best-selling product. Pain-solution format. Audience: 25-40, online shoppers.","rationale":"Eric creates ad copy variants ready to test immediately."},
     {"agent_name":"Purity","brief":"Create an FAQ document for our 10 most common customer support questions.","rationale":"Purity builds a knowledge base that reduces support volume from day one."},
     {"agent_name":"Bill","brief":"Set up an invoice template for our standard product orders including terms and payment details.","rationale":"Bill creates a professional invoice template you can use immediately."}
   ]
 }'::jsonb,
 'orca_official', 'starter', 0, true),

('recruiting-firm',
 'Recruiting Firm',
 'For boutique recruitment agencies. Activates People & Hiring, Sales, Intelligence, and Ops with a hiring-first setup.',
 'recruiting_firm',
 ARRAY['recruiting','hiring','hr','talent'],
 '{
   "departments": [
     {"key":"hiring","agent_mode":"approve_first","priority":"high","description":"Sourcing, screening, verification","active_agents":["Marcus","Vera","Zara","Eli"]},
     {"key":"sales","agent_mode":"approve_first","priority":"high","description":"Client prospecting and outreach","active_agents":["Rex","Mark","Clara"]},
     {"key":"intel","agent_mode":"autopilot","priority":"medium","description":"Market and company research","active_agents":["Roman","Sage","Nate"]},
     {"key":"ops","agent_mode":"autopilot","priority":"low","description":"Task and calendar management","active_agents":["Atlas","Cal","Dean"]}
   ],
   "suggested_integrations": ["linkedin_hiring","workable","gmail_outreach","hubspot","notion"],
   "day1_briefs": [
     {"agent_name":"Marcus","brief":"Source 10 senior software engineering candidates who are open to work and based in East Africa. Include LinkedIn profile links and contact info.","rationale":"Marcus fills your first candidate pipeline immediately."},
     {"agent_name":"Vera","brief":"Create a screening scorecard for senior software engineers. Include technical skills, culture fit, and red flag criteria.","rationale":"Vera standardises your screening process from day one."},
     {"agent_name":"Rex","brief":"Find 10 fast-growing startups in East Africa that are likely hiring engineers in the next 90 days. Include funding info and team size.","rationale":"Rex builds your client prospect list with companies actively in hiring mode."},
     {"agent_name":"Zara","brief":"Create a background verification checklist for candidates we plan to hire. Include employment history, references, and identity verification steps.","rationale":"Zara creates a repeatable verification process before your first placement."}
   ]
 }'::jsonb,
 'orca_official', 'pro', 0, true),

('dev-agency',
 'Dev Agency',
 'For software development agencies. Activates Tech, Ops, Sales, and Finance with a developer-first configuration.',
 'dev_agency',
 ARRAY['dev','agency','software','engineering'],
 '{
   "departments": [
     {"key":"tech","agent_mode":"approve_first","priority":"high","description":"Code reviews, security, DevOps, docs","active_agents":["Ghost","Cipher","Wren","Hex"]},
     {"key":"ops","agent_mode":"autopilot","priority":"high","description":"Project management and coordination","active_agents":["Atlas","Dean","Iris","Owen"]},
     {"key":"sales","agent_mode":"approve_first","priority":"medium","description":"Client prospecting and pipeline","active_agents":["Rex","Clara","Mark"]},
     {"key":"finance","agent_mode":"approve_first","priority":"medium","description":"Invoicing and contracts","active_agents":["Bill","Lena","Reid"]}
   ],
   "suggested_integrations": ["github","linear","vercel","hubspot","notion","stripe_revenue","docusign"],
   "day1_briefs": [
     {"agent_name":"Cipher","brief":"Review our GitHub repository structure and suggest improvements to our code review and PR approval process.","rationale":"Cipher establishes code quality standards before the next PR."},
     {"agent_name":"Hex","brief":"Create a README template for our client project repositories. Include setup instructions, architecture overview, and contribution guidelines.","rationale":"Hex creates a professional documentation standard your whole team uses."},
     {"agent_name":"Rex","brief":"Find 10 funded startups that recently announced a product launch and likely need development support. Include funding stage and tech stack if visible.","rationale":"Rex builds a warm prospect list of companies in active build mode."},
     {"agent_name":"Lena","brief":"Draft a standard software development contract template for client projects. Include scope, payment terms, IP ownership, and termination clauses.","rationale":"Lena creates a legally sound contract template you can customise per client."}
   ]
 }'::jsonb,
 'orca_official', 'pro', 0, true),

('intelligence-research-desk',
 'Intelligence & Research Desk',
 'For research teams and think tanks. Activates Intelligence, Community, and Ops for deep market and competitive research.',
 'intelligence',
 ARRAY['research','intelligence','competitive','analysis'],
 '{
   "departments": [
     {"key":"intel","agent_mode":"autopilot","priority":"high","description":"Research, signals, summaries, forecasting","active_agents":["Roman","Sage","Nate","Ada","Dex"]},
     {"key":"community","agent_mode":"approve_first","priority":"medium","description":"Community and partnerships","active_agents":["Milo","Rio","Spike"]},
     {"key":"ops","agent_mode":"autopilot","priority":"low","description":"Notes and project management","active_agents":["Atlas","Dean","Iris"]}
   ],
   "suggested_integrations": ["perplexity","semrush","ahrefs","notion","slack"],
   "day1_briefs": [
     {"agent_name":"Roman","brief":"Research the AI Company OS and AI agent management market. Identify all key players, their positioning, pricing models, and target customers. Deliver a structured competitive landscape report.","rationale":"Roman builds the foundational competitive intelligence your whole team will reference."},
     {"agent_name":"Sage","brief":"Set up monitoring for these keywords: AI agents, AI company OS, autonomous company, multi-agent systems — on LinkedIn, X, and Reddit. Alert me to significant activity.","rationale":"Sage keeps continuous watch on the market so you never miss a signal."},
     {"agent_name":"Nate","brief":"Create a weekly intelligence brief template. Include sections for: market movements, competitor updates, technology signals, funding news, and key takeaways.","rationale":"Nate builds the brief format your team will use every week."},
     {"agent_name":"Ada","brief":"Build a 6-month growth forecast model for the AI tools market segment. Include TAM estimate, growth rate assumptions, and key risk factors.","rationale":"Ada gives your research a quantitative foundation for strategic planning."}
   ]
 }'::jsonb,
 'orca_official', 'pro', 0, true);
```

---

## STEP 6 — GMAIL SMTP (ALREADY CONNECTED — VERIFY THIS WORKS)

Since Gmail SMTP is already connected, verify these Supabase settings are correct:

**Supabase Dashboard → Authentication → Settings → SMTP:**
- Enable Custom SMTP: **ON**
- Host: `smtp.gmail.com`
- Port: `587`
- Username: your Gmail address
- Password: your 16-character App Password (no spaces)
- Sender name: `ORCA`
- Sender email: your Gmail address

**Test it:** Go to Supabase → Authentication → Users → Invite user (paste any test email).
If it arrives — Gmail SMTP is working correctly.
If it doesn't — double-check the App Password has no spaces and 2FA is enabled on the Gmail account.

**Redirect URL:** Make sure this is set in Supabase → Authentication → URL Configuration:
- Site URL: `https://your-vercel-domain.vercel.app`
- Redirect URLs: `https://your-vercel-domain.vercel.app/**`

---

## COMPLETE BUILD CHECKLIST

Work through these in order. Each step unlocks the next.

### Foundation
- [ ] `lib/seed/agentData.ts` created with all 45 agents + 9 departments
- [ ] `lib/seed/seedOrg.ts` created with `seedNewOrg()` function
- [ ] `seedNewOrg(org.id)` called in signup route after org is created
- [ ] Test: create a new account → check Supabase → departments table has 9 rows → agents table has 45 rows linked to the org

### Onboarding data flow
- [ ] `app/api/onboarding/progress/route.ts` created
- [ ] Onboarding frontend calls `POST /api/onboarding/progress` on each step completion
- [ ] `app/api/company/route.ts` GET and PUT handlers created
- [ ] Test: complete onboarding → check Supabase → `company_identity` has mission, brand voice, ICP filled in

### Missing endpoints
- [ ] `app/api/org/stats/route.ts` created and tested
- [ ] `app/api/org/activity/route.ts` created and tested
- [ ] `app/api/org/coordination/route.ts` created and tested
- [ ] `app/api/orcahub/route.ts` GET handler created (install handler already exists)
- [ ] Test each endpoint directly: `curl https://your-domain/api/org/stats` with a valid session cookie

### Database
- [ ] 6 OrcaHub templates seeded via SQL above
- [ ] Supabase Realtime enabled for: `messages`, `coordination_events`, `approval_requests`, `team_messages`
- [ ] Test: insert a row into `coordination_events` in Supabase → coordination feed updates in browser without refresh

### Frontend connection
- [ ] `useRealtimeCoordination` hook added to Command Center
- [ ] `useRealtimeActivity` hook added to Live Activity Feed
- [ ] `useRealtimeApprovals` hook added to Review page badge
- [ ] `useStatsRefresh` hook added to stat cards
- [ ] Command Center fetches `/api/org/stats` on load
- [ ] Activity feed fetches `/api/org/activity` on load
- [ ] Coordination feed fetches `/api/org/coordination` on load
- [ ] OrcaHub page fetches `/api/orcahub` on load

### Gmail SMTP
- [ ] Supabase Custom SMTP settings verified (host, port, username, app password)
- [ ] Test signup with a real email — verification email arrives
- [ ] Redirect URL configured in Supabase Auth settings

### Final end-to-end test
- [ ] Create new account with a real email
- [ ] Verify email arrives via Gmail SMTP
- [ ] Complete 5-step onboarding
- [ ] Dashboard loads with 9 departments, 45 agents visible
- [ ] Stat cards show real numbers (not zeros — may need to send a first agent brief)
- [ ] Brief an agent → message appears in conversation thread
- [ ] Approve a message → audit log entry created
- [ ] OrcaHub page shows 6 templates
- [ ] Install a template → departments activate, Day 1 briefs appear

---

*Nexonic Industries · nexonic-industries.vercel.app*
