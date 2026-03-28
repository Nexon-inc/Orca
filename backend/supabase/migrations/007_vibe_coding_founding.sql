-- Migration: 007_vibe_coding_founding
-- Description: Add tech_mode to departments and create founding member tables.

-- Change 3: Tech department mode seleciton
alter table public.departments
  add column if not exists tech_mode text
  check (tech_mode in ('build_for_me', 'build_with_me'));

-- Change 9: Founding member tracking
create table if not exists public.founding_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  org_id uuid references public.organizations(id),
  spot_number integer not null,
  locked_price numeric(6,2) not null default 19.00,
  created_at timestamptz default now()
);

-- Track total spots
create table if not exists public.founding_config (
  id uuid primary key default gen_random_uuid(),
  total_spots integer not null default 50,
  spots_taken integer not null default 0,
  updated_at timestamptz default now()
);

-- Seed with initial config if not already present
insert into public.founding_config (total_spots, spots_taken)
select 50, 0
where not exists (select 1 from public.founding_config);
