-- ============================================================
-- ORCA Database Schema — 002 RLS Policies
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.company_identity enable row level security;
alter table public.departments enable row level security;
alter table public.agents enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.team_messages enable row level security;
alter table public.coordination_events enable row level security;
alter table public.approval_requests enable row level security;
alter table public.dept_reports enable row level security;
alter table public.integrations enable row level security;
alter table public.invite_tokens enable row level security;
alter table public.audit_logs enable row level security;
alter table public.oauth_states enable row level security;

-- Profiles
create policy "users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Organizations: members can view their org
create policy "org members can view org"
  on public.organizations for select using (
    id in (select org_id from public.org_members where user_id = auth.uid())
  );

create policy "owners can update org"
  on public.organizations for update using (
    owner_id = auth.uid()
  );

-- Org members
create policy "org members can view members"
  on public.org_members for select using (
    org_id in (select org_id from public.org_members where user_id = auth.uid())
  );

-- Company identity
create policy "org members can view company identity"
  on public.company_identity for select using (
    org_id in (select org_id from public.org_members where user_id = auth.uid())
  );

create policy "owners can update company identity"
  on public.company_identity for all using (
    org_id in (
      select org_id from public.org_members
      where user_id = auth.uid() and role in ('owner', 'cofounder')
    )
  );

-- Departments
create policy "org members can view departments"
  on public.departments for select using (
    org_id in (select org_id from public.org_members where user_id = auth.uid())
  );

-- Agents
create policy "org members can view agents"
  on public.agents for select using (
    department_id in (
      select d.id from public.departments d
      inner join public.org_members m on m.org_id = d.org_id
      where m.user_id = auth.uid()
    )
  );

-- Messages: users can see messages in their conversations
create policy "users can view own messages"
  on public.messages for select using (
    conversation_id in (
      select id from public.conversations where user_id = auth.uid()
    )
  );

-- Team messages
create policy "users can view team messages"
  on public.team_messages for select using (
    from_user_id = auth.uid() or to_user_id = auth.uid()
  );

-- Coordination events
create policy "org members can view coordination events"
  on public.coordination_events for select using (
    org_id in (select org_id from public.org_members where user_id = auth.uid())
  );

-- Approval requests
create policy "org members can view approval requests"
  on public.approval_requests for select using (
    org_id in (select org_id from public.org_members where user_id = auth.uid())
  );

-- Integrations
create policy "org members can view integrations"
  on public.integrations for select using (
    org_id in (select org_id from public.org_members where user_id = auth.uid())
  );

-- Audit logs
create policy "owners can view audit logs"
  on public.audit_logs for select using (
    org_id in (
      select org_id from public.org_members
      where user_id = auth.uid() and role in ('owner', 'cofounder')
    )
  );

-- OAuth states — users can only see their own
create policy "oauth_states_own_only"
  on public.oauth_states for all using (user_id = auth.uid());

-- Waitlist — anyone can insert (public endpoint)
alter table public.waitlist enable row level security;
create policy "anyone can join waitlist"
  on public.waitlist for insert with check (true);
