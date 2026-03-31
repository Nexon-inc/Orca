// Call this immediately after creating an org — seeds all active depts + agents
// Pivot Update: 5 active departments, 25 agents

import { createClient } from '@supabase/supabase-js'
import { DEPARTMENT_SEED_DATA, AGENT_SEED_DATA } from './agentData'

const ACTIVE_DEPT_KEYS = ['marketing', 'sales', 'cs', 'intel', 'tech', 'ops']

export async function seedNewOrg(orgId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Filter and Insert 6 departments (Active 5 + Ops for Atlas)
  const deptsToSeed = [
    { key: 'marketing', name: 'Marketing',            icon: '📣' },
    { key: 'sales',     name: 'Sales & Revenue',      icon: '💼' },
    { key: 'cs',        name: 'Customer Success',     icon: '🤝' },
    { key: 'tech',      name: 'Tech & Vibe Coding',   icon: '🛡️' },
    { key: 'intel',     name: 'Intelligence & Research', icon: '🔍' },
    { key: 'ops',       name: 'Operations',           icon: '📋' },
  ]
  
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .insert(
      deptsToSeed.map(dept => ({
        org_id: orgId,
        key: dept.key,
        name: dept.name,
        icon: dept.icon,
        agent_mode: 'approve_first',
        agents_paused: false,
      }))
    )
    .select('id, key')

  if (deptError) {
    console.error('Department seed failed:', deptError)
    throw deptError
  }

  const deptMap = Object.fromEntries(
    (departments || []).map(d => [d.key, d.id])
  )

  // 2. Insert 6 agents linked to departments
  const agentRows = AGENT_SEED_DATA.map(agent => ({
    department_id: deptMap[agent.dept],
    name: agent.name,
    icon: agent.icon,
    acronym: agent.acronym,
    role_description: agent.role,
    csuite_title: (agent as any).csuite_title || null,
    is_department_head: true,
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

  return { departments_seeded: deptsToSeed.length, agents_seeded: agentRows.length }
}
