'use server'
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceClient = createServiceSupabaseClient()
  const { data: conversations } = await serviceClient
    .from('conversations')
    .select(`
      id, title, department_key, created_at, updated_at,
      agents (id, name, icon, acronym, role_description)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })

  return NextResponse.json({ conversations })
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const rawAgentId = body.agent_id;
  const agentName = body.agent_name;
  const departmentKey = body.department_key;
  
  const supabase = await createServerSupabaseClient();
  const serviceClient = createServiceSupabaseClient();

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single();

  if (!member) return NextResponse.json({ error: 'No organisation found' }, { status: 404 });

  // Intelligent Agent Resolution (Bypassing UUID errors)
  let resolvedAgentId = null;
  const isGenericString = typeof rawAgentId === 'string' && rawAgentId.length < 32 && !rawAgentId.includes('-');

  if (!rawAgentId || isGenericString || agentName) {
    let query = supabase
      .from('agents')
      .select('id, departments!inner(org_id)')
      .eq('departments.org_id', member.org_id);
    
    if (agentName) {
      // Safely map frontend role shortcuts to exact internal Agent names
      const roleToName: Record<string, string> = {
        'CEO': 'Atlas',
        'CMO': 'Aria',
        'CSO': 'Rex',
        'CIO': 'Roman',
        'CTO': 'Ghost',
        'CCO': 'Purity'
      };
      const actualName = roleToName[agentName.toUpperCase()] || agentName;
      query = query.ilike('name', actualName);
    } else if (rawAgentId && typeof rawAgentId === 'string') {
      query = query.ilike('name', rawAgentId);
    }
    
    const { data: foundAgent } = await query.limit(1).single();
    resolvedAgentId = foundAgent?.id || null;
  } else {
    // If it's explicitly a UUID format, trust it
    resolvedAgentId = rawAgentId;
  }

  // Pure fallback: Just grab any primary agent (typically ATLAS) so it never fails
  if (!resolvedAgentId) {
    const { data: defaultAgent } = await supabase
      .from('agents')
      .select('id, departments!inner(org_id)')
      .eq('departments.org_id', member.org_id)
      .limit(1)
      .single();
    resolvedAgentId = defaultAgent?.id || null;
  }

  // Finalize department key fallback
  const dmap: Record<string, string> = {
    cmo: 'marketing',
    cso: 'sales',
    cco: 'cs',
    cio: 'intel',
    cto: 'tech',
    ceo: 'ops'
  };
  
  const finalDeptKey = dmap[departmentKey?.toLowerCase()] || 'ops';

  const { data: conversation, error } = await serviceClient
    .from('conversations')
    .insert({ 
      org_id: member.org_id, 
      user_id: user.id, 
      agent_id: resolvedAgentId, 
      department_key: finalDeptKey 
    })
    .select()
    .single();

   if (error) {
     console.error('CONVERSATION_CREATE_ERROR:', error);
     return NextResponse.json({ 
       error: error.message, 
       details: error.details,
       hint: error.hint,
       code: error.code 
     }, { status: 400 });
   }

  return NextResponse.json({ conversation });
}
