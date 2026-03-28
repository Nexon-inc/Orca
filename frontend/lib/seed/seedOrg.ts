// Call this immediately after creating an org — seeds all 9 depts + 45 agents

import { createClient } from '@supabase/supabase-js'
import { DEPARTMENT_SEED_DATA, AGENT_SEED_DATA, ACTIVE_DEPT_KEYS } from './agentData'

export async function seedNewOrg(orgId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Filter to active departments only
  const activeDepts = DEPARTMENT_SEED_DATA.filter(d => 
    ACTIVE_DEPT_KEYS.includes(d.key)
  )
  
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .insert(
      activeDepts.map(dept => ({
        org_id: orgId,
        key: dept.key,
        name: dept.name,
        icon: dept.icon,
        agent_mode: 'approve_first',
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

  // 2. Filter to active agents only (5 agents per active dept = 25)
  const activeAgentsData = AGENT_SEED_DATA.filter(a => 
    ACTIVE_DEPT_KEYS.includes(a.dept)
  )

  const agentRows = activeAgentsData.map(agent => ({
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

  return { departments_seeded: activeDepts.length, agents_seeded: activeAgentsData.length }
}
