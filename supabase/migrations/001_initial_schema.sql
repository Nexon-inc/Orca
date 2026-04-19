-- ============================================================
-- ORCA Database Schema — 001 Initial
-- Run in Supabase SQL Editor or save as supabase/migrations/
-- ============================================================

-- ─── 2.1 USERS & ORGANISATIONS ──────────────────────────────

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_initials text generated always as (upper(left(full_name, 1))) stored,
  job_title text,
  timezone text default 'UTC',
  language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references public.profiles(id) not null,
  plan text not null default 'free'
    check (plan in ('free','starter','pro','enterprise')),
  plan_expires_at timestamptz,
  -- Paystack billing
  paystack_customer_code text unique,
  paystack_subscription_code text unique,
  -- Onboarding state
  onboarding_completed boolean not null default false,
  onboarding_step integer not null default 1,
  -- Checkout concurrency lock
  checkout_locked_at timestamptz,
  checkout_locked_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('owner','cofounder','head','member','advisor')),
  department_key text check (department_key in (
    'ops','marketing','sales','cs','tech','intel'
  )),
  invited_by uuid references public.profiles(id),
  joined_at timestamptz default now(),
  unique(org_id, user_id)
);

-- ─── 2.2 COMPANY IDENTITY ───────────────────────────────────

create table public.company_identity (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade unique not null,
  company_name text,
  industry text,
  stage text check (stage in ('idea','pre_revenue','early_revenue','growth','scale')),
  mission text,
  brand_voice text check (brand_voice in (
    'professional','casual','bold','friendly','technical','authoritative'
  )),
  icp text,
  geography text,
  competitors text[],
  brand_colors jsonb default '{"primary": "#00FF87", "secondary": "#030a06"}',
  logo_url text,
  knowledge_base_url text,
  crm_connected text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── 2.3 DEPARTMENTS & AGENTS ───────────────────────────────

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  key text not null check (key in (
    'ops','marketing','sales','cs','tech','intel'
  )),
  name text not null,
  icon text not null,
  head_user_id uuid references public.profiles(id),
  agent_mode text not null default 'approve_first'
    check (agent_mode in ('autopilot','approve_first','suggest_only')),
  agents_paused boolean default false,
  created_at timestamptz default now(),
  unique(org_id, key)
);

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references public.departments(id) on delete cascade not null,
  name text not null,
  icon text not null,       -- e.g. '🎙️' for Aria, '👻' for Ghost
  acronym text not null,    -- used internally e.g. 'AR', 'GH', 'RX'
  role_description text not null,
  status text not null default 'idle'
    check (status in ('active','busy','idle')),
  tasks_today integer default 0,
  last_action text,
  last_active_at timestamptz,
  created_at timestamptz default now()
);
-- NOTE: Seed with 45 agents (5 per dept × 9 depts) — see agents.md for full roster

-- ─── 2.4 CONVERSATIONS & MESSAGES ───────────────────────────

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  agent_id uuid references public.agents(id) not null,
  department_key text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_type text not null check (sender_type in ('user','agent')),
  content text not null,
  result_items jsonb,
  status text default 'pending'
    check (status in ('pending','approved','rejected','blocked')),
  created_at timestamptz default now()
);

create table public.team_messages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  from_user_id uuid references public.profiles(id) not null,
  to_user_id uuid references public.profiles(id) not null,
  content text not null,
  is_system_notification boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- ─── 2.5 COORDINATION & APPROVALS ───────────────────────────

create table public.coordination_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  from_agent_id uuid references public.agents(id),
  to_agent_id uuid references public.agents(id),
  type text not null check (type in ('handoff','alert','trigger','brief')),
  description text not null,
  context jsonb,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','complete')),
  auto_approved boolean default false,
  chain_depth integer not null default 0,
  chain_root_event_id uuid references public.coordination_events(id),
  chain_summary text,
  created_at timestamptz default now()
);

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  initiated_by_user_id uuid references public.profiles(id),
  initiated_by_agent_id uuid references public.agents(id),
  target_department_key text,
  target_agent_id uuid references public.agents(id),
  context text not null,
  urgency text not null default 'info'
    check (urgency in ('urgent','warning','info')),
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','modified')),
  version integer not null default 0, -- optimistic locking
  head_approved_by uuid references public.profiles(id),
  head_approved_at timestamptz,
  ceo_approved boolean default false,
  ceo_approved_at timestamptz,
  ceo_approved_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ─── 2.6 DEPT REPORTS & INTEGRATIONS ────────────────────────

create table public.dept_reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  department_key text not null,
  submitted_by_user_id uuid references public.profiles(id),
  period_start date not null,
  period_end date not null,
  stats jsonb not null default '{}',
  acknowledged_by_ceo boolean default false,
  acknowledged_at timestamptz,
  created_at timestamptz default now()
);

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  service_name text not null,
  department_key text,
  status text not null default 'disconnected'
    check (status in ('connected','disconnected')),
  access_token_encrypted text,
  refresh_token_encrypted text,
  metadata jsonb default '{}',
  connected_at timestamptz,
  created_at timestamptz default now(),
  unique(org_id, service_name)
);

-- ─── 2.7 INVITE TOKENS ──────────────────────────────────────

create table public.invite_tokens (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  invited_by uuid references public.profiles(id) not null,
  email text not null,
  role text not null check (role in ('cofounder','head','member','advisor')),
  department_key text,
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  accepted boolean default false,
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

-- ─── 2.8 WAITLIST ─────────────────────────────────────────────

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  company text,
  biggest_bottleneck text,
  department_needed text,
  referral_source text,
  created_at timestamptz default now()
);

-- ─── AUDIT LOGS ──────────────────────────────────────────────

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  actor_user_id uuid references public.profiles(id),
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb default '{}',
  ip_address text,
  created_at timestamptz default now()
);

-- ─── OAUTH STATES (CSRF protection) ─────────────────────────

create table public.oauth_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  service_key text not null,
  state text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  unique(user_id, service_key)
);

create index idx_oauth_states_expires on public.oauth_states(expires_at);
