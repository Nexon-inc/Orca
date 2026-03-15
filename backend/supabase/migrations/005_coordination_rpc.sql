-- Migration 005: Coordination Concurrency RPC

create or replace function get_active_coordination_count(p_org_id uuid)
returns integer as $$
  select count(*)::integer
  from public.coordination_events
  where org_id = p_org_id
    and status = 'pending'
    and created_at > now() - interval '5 minutes';
$$ language sql security definer;
