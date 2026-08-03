const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function runMigration() {
  const sql = `
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
`;

  try {
    const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({ query: sql })
    });

    const text = await res.text();
    console.log('exec_sql RPC response:', res.status, text);

    const { error: bcpErr } = await supabase.from('bcp').select('id').limit(1);
    console.log('BCP table check error:', bcpErr ? bcpErr.message : 'Table exists!');

  } catch (err) {
    console.error('Migration error:', err);
  }
}

runMigration();
