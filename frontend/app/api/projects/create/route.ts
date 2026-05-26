'use server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, niche, audience, competitor, operationalFocus } = await request.json()
    if (!name) return NextResponse.json({ error: 'Missing project name' }, { status: 400 })

    const serviceClient = createServiceSupabaseClient()

    // 1. Insert new Organization (Builder Tier as requested for paying users)
    const { data: org, error: orgError } = await serviceClient
      .from('organizations')
      .insert({
        name,
        plan: 'builder',
        onboarding_completed: true,
        onboarding_step: 3
      })
      .select()
      .single()

    if (orgError || !org) {
      return NextResponse.json({ error: orgError?.message || 'Failed to create organization' }, { status: 400 })
    }

    // 2. Insert User as Owner in org_members
    const { error: memberError } = await serviceClient
      .from('org_members')
      .insert({
        org_id: org.id,
        user_id: user.id,
        role: 'owner',
        department_key: 'ops'
      })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 400 })
    }

    // 3. Provision Default Departments
    const deptsToCreate = [
      { key: 'ops', name: 'Operations Office', icon: '🏦' },
      { key: 'marketing', name: 'Marketing Campaigns', icon: '🎙️' },
      { key: 'sales', name: 'Sales Pipeline', icon: '💰' },
      { key: 'cs', name: 'Customer Operations', icon: '🛟' },
      { key: 'intel', name: 'Intelligence & Feeds', icon: '🏛️' },
      { key: 'tech', name: 'Product Engineering', icon: '👻' }
    ]

    const createdDepts = []
    for (const d of deptsToCreate) {
      const { data: dept, error: dError } = await serviceClient
        .from('departments')
        .insert({
          org_id: org.id,
          key: d.key,
          name: d.name,
          icon: d.icon,
          agents_paused: false
        })
        .select()
        .single()

      if (!dError && dept) {
        createdDepts.push(dept)
      }
    }

    // 4. Provision Default Agents
    const agentsToCreate = [
      { name: 'Atlas', acronym: 'CEO', icon: '🏦', desc: 'Executive automation and workflow coordination officer', deptKey: 'ops' },
      { name: 'Aria', acronym: 'CMO', icon: '🎙️', desc: 'Growth campaigns and public positioning architect', deptKey: 'marketing' },
      { name: 'Rex', acronym: 'CSO', icon: '💰', desc: 'B2B sales sequences and prospecting officer', deptKey: 'sales' },
      { name: 'Purity', acronym: 'CCO', icon: '🛟', desc: 'Onboarding and concierge customer operations officer', deptKey: 'cs' },
      { name: 'Roman', acronym: 'CIO', icon: '🏛️', desc: 'Market intelligence and competitor research analyst', deptKey: 'intel' },
      { name: 'Ghost', acronym: 'CTO', desc: 'Scaffolding architect and developer integration officer', icon: '👻', deptKey: 'tech' }
    ]

    for (const a of agentsToCreate) {
      const matchedDept = createdDepts.find(d => d.key === a.deptKey)
      if (matchedDept) {
        await serviceClient
          .from('agents')
          .insert({
            name: a.name,
            acronym: a.acronym,
            icon: a.icon,
            role_description: a.desc,
            department_id: matchedDept.id
          })
      }
    }

    // 5. Store intake questions in organization metadata or description (if we have a field, otherwise we can insert a welcome briefing!)
    // Let's create an initial "Welcome Briefing" conversation to kick off their startup journey!
    const { data: defaultAgent } = await serviceClient
      .from('agents')
      .select('id, departments!inner(id, org_id)')
      .eq('departments.org_id', org.id)
      .ilike('name', 'Atlas')
      .limit(1)
      .single()

    if (defaultAgent) {
      const { data: conv } = await serviceClient
        .from('conversations')
        .insert({
          org_id: org.id,
          user_id: user.id,
          agent_id: defaultAgent.id,
          department_key: 'ops',
          title: 'Welcome to ' + name
        })
        .select()
        .single()

      if (conv) {
        await serviceClient.from('messages').insert({
          conversation_id: conv.id,
          sender_type: 'agent',
          content: `# Welcome to ${name}!\n\nI am **Atlas, your CEO agent**. I have provisioned your operational office. Here are the startup parameters we are launching under:\n\n* **Startup Name**: ${name}\n* **Target Niche**: ${niche}\n* **Primary Audience**: ${audience}\n* **Key Competitor**: ${competitor}\n* **Operational Focus**: ${operationalFocus}\n\nOur full C-Suite (**Aria (CMO)**, **Rex (CSO)**, **Purity (CCO)**, **Roman (CIO)**, and **Ghost (CTO)**) is online and ready for deployment. What would you like us to scaffold first?`,
          result_items: ['Startup provisioned', 'Executive team online', 'Welcome brief generated']
        })
      }
    }

    return NextResponse.json({ success: true, orgId: org.id })
  } catch (err: any) {
    console.error('[PROJECT_CREATE_ERR]', err)
    return NextResponse.json({ error: 'Server Error', details: err.message }, { status: 500 })
  }
}
