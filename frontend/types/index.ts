export interface CompanyIdentity {
  org_id: string
  company_name: string
  industry: string
  stage: string
  mission: string
  brand_voice: string
  icp: string
  geography: string
  competitors: string[]
  brand_colors: any
  logo_url?: string
  knowledge_base_url?: string
  crm_connected?: string
}

export interface Agent {
  id: string
  department_id: string
  name: string
  icon: string
  acronym: string
  role_description: string
  status: 'active' | 'busy' | 'idle'
  tasks_today: number
  last_action?: string
  last_active_at?: string
  departments?: {
    agent_mode: 'autopilot' | 'approve_first' | 'suggest_only'
  }
}

export interface OrgMember {
  id: string
  org_id: string
  user_id: string
  role: 'owner' | 'cofounder' | 'head' | 'member' | 'advisor'
  department_key?: string
}
