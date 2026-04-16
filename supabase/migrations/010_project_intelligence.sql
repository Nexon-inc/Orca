-- ============================================================
-- ORCA Project Intelligence — 010
-- ============================================================

-- ─── 1. PROJECT MILESTONES ───────────────────────────────────
-- Tracks progress phases (Idea -> Launch)
create table public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'pending' 
    check (status in ('pending', 'in_progress', 'completed')),
  phase integer not null default 1,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- ─── 2. PROJECT INPUTS (AI QUESTIONNAIRE) ────────────────────
-- Stores questions Atlas asks the user for discovery
create table public.project_inputs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade not null,
  question text not null,
  answer text,
  category text check (category in ('vision', 'market', 'product', 'technical')),
  urgency text default 'normal' check (urgency in ('low', 'normal', 'high')),
  is_answered boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── 3. RLS POLICIES ─────────────────────────────────────────

alter table public.project_milestones enable row level security;
alter table public.project_inputs enable row level security;

create policy "Users can view milestones for their orgs"
  on public.project_milestones for select
  using (
    exists (
      select 1 from public.org_members
      where org_id = project_milestones.org_id
      and user_id = auth.uid()
    )
  );

create policy "Users can view/update inputs for their orgs"
  on public.project_inputs for all
  using (
    exists (
      select 1 from public.org_members
      where org_id = project_inputs.org_id
      and user_id = auth.uid()
    )
  );
