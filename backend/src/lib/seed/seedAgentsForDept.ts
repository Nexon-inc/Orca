// Use this when installing individual depts from OrcaHub templates

import { createClient } from '@supabase/supabase-js'
import { AGENT_SEED_DATA } from './agentData'

export async function seedAgentsForDept(orgId: string, deptKey: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get dept id
  const { data: dept } = await supabase
    .from('departments')
    .select('id')
    .eq('org_id', orgId)
    .eq('key', deptKey)
    .single()

  if (!dept) return

  // Check if agents already seeded (idempotent)
  const { count } = await supabase
    .from('agents')
    .select('id', { count: 'exact', head: true })
    .eq('department_id', dept.id)

  if ((count ?? 0) > 0) return // Already seeded — skip

  const agents = AGENT_SEED_DATA.filter(a => a.dept === deptKey)
  await supabase.from('agents').insert(
    agents.map(a => ({
      department_id: dept.id,
      name: a.name,
      icon: a.icon,
      acronym: a.acronym,
      role_description: a.role,
      status: 'idle',
      tasks_today: 0,
    }))
  )
}
