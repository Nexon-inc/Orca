-- Migration: Create Lunar AI BCP and Conversations tables
create table if not exists public.bcp (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade unique,
  version integer not null default 1,
  company_snapshot jsonb default '{}',
  business_goals jsonb default '{}',
  products jsonb default '[]',
  connected_systems jsonb default '{}',
  active_agents jsonb default '[]',
  customer_insights jsonb default '{}',
  team_context jsonb default '{}',
  historical_memory jsonb default '{}',
  orca_context jsonb default '{}',
  lunar_operating_rules jsonb default '{}',
  bcp_events jsonb default '[]',
  conflicts jsonb default '[]',
  onboarding_score integer default 0,
  last_updated_by text default 'lunar',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bcp enable row level security;

drop policy if exists "bcp_org_only" on public.bcp;
create policy "bcp_org_only"
  on public.bcp for all
  using (org_id in (
    select org_id from public.org_members where user_id = auth.uid()
  ));

create index if not exists bcp_org_id on public.bcp(org_id);

create table if not exists public.lunar_conversations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  user_message text not null,
  lunar_response text not null,
  bcp_updates integer default 0,
  created_at timestamptz default now()
);

alter table public.lunar_conversations enable row level security;

drop policy if exists "lunar_conversations_org_only" on public.lunar_conversations;
create policy "lunar_conversations_org_only"
  on public.lunar_conversations for all
  using (org_id in (
    select org_id from public.org_members where user_id = auth.uid()
  ));
