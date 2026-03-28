-- Migration 004: Security and Ecosystem Tables

-- 1. Webhook deduplication
create table if not exists public.processed_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'paystack',
  event_reference text not null,
  event_type text not null,
  processed_at timestamptz default now(),
  unique(provider, event_reference)
);
create index if not exists idx_webhook_events_ref on public.processed_webhook_events(event_reference);

-- 2. Agent action rate limits
create table if not exists public.agent_action_limits (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  action_date date not null default current_date,
  action_count integer not null default 0,
  limit_cap integer not null default 50,
  unique(agent_id, action_date)
);
create index if not exists idx_agent_limits_today on public.agent_action_limits(agent_id, action_date);

-- 3. API rate limit buckets
create table if not exists public.rate_limit_buckets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  bucket_key text not null,
  count integer not null default 1,
  window_start timestamptz not null default now(),
  unique(user_id, bucket_key)
);

-- 4. Audit log
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  actor_user_id uuid references public.profiles(id),
  actor_type text not null check (actor_type in ('user', 'agent', 'system')),
  action text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb default '{}',
  ip_address inet,
  created_at timestamptz default now()
);
create index if not exists idx_audit_log_org_id on public.audit_log(org_id);
create index if not exists idx_audit_log_created on public.audit_log(created_at desc);
alter table public.audit_log enable row level security;
create policy "audit_log_select_org_members"
  on public.audit_log for select
  using (
    org_id in (
      select org_id from public.org_members where user_id = auth.uid()
    )
  );

-- 5. Increment agent action count function
create or replace function increment_agent_action_count(
  p_agent_id uuid,
  p_date date
) returns void as $$
begin
  insert into public.agent_action_limits (agent_id, action_date, action_count)
  values (p_agent_id, p_date, 1)
  on conflict (agent_id, action_date)
  do update set action_count = agent_action_limits.action_count + 1;
end;
$$ language plpgsql security definer;

-- 6. Paystack columns on organizations
alter table public.organizations
  add column if not exists paystack_customer_code text unique,
  add column if not exists paystack_subscription_code text unique;

-- 7. Revoked users
create table if not exists public.revoked_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  org_id uuid references public.organizations(id) on delete cascade not null,
  revoked_at timestamptz default now(),
  revoked_by uuid references public.profiles(id),
  reason text,
  unique(user_id, org_id)
);
create index if not exists idx_revoked_users_user on public.revoked_users(user_id);

-- 8. Candidate Verifications (Intuition)
create table if not exists public.candidate_verifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  candidate_name text,
  candidate_email text,
  intuition_score numeric(5,2),
  verdict text check (verdict in ('verified','flagged','needs_review')),
  flags jsonb default '[]',
  raw_result jsonb,
  verified_by_agent_id uuid references public.agents(id),
  created_at timestamptz default now()
);

-- 9. Email Normalization and IP Rate Limit
alter table public.profiles
  add column if not exists signup_ip inet,
  add column if not exists email_normalized text unique;

-- 10. Checkout locks
alter table public.organizations
  add column if not exists checkout_locked_at timestamptz,
  add column if not exists checkout_locked_by uuid references public.profiles(id);

-- 11. Coordination depth chain
alter table public.coordination_events
  add column if not exists chain_depth integer not null default 0,
  add column if not exists chain_root_event_id uuid references public.coordination_events(id),
  add column if not exists chain_summary text;

-- 13. Optimistic Locking
alter table public.messages add column if not exists version integer not null default 1;

-- 14. Coordination Status Tracking
create table if not exists public.coordination_links (
  id uuid primary key default gen_random_uuid(),
  source_message_id uuid references public.messages(id),
  target_conversation_id uuid references public.conversations(id),
  trigger_reason text,
  created_at timestamptz default now()
);
