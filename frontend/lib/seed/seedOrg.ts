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
        agents_paused: true,
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
