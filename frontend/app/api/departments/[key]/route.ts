import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getGemini, getGroq } from '@/lib/ai/client'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'

export async function POST(
  request: Request,
  { params }: { params: { key: string } }
) {
  const { key: deptKey } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content: userBrief } = await request.json()
  const supabase = await createServerSupabaseClient()

  // 1. Get Department & Agents
  const { data: dept } = await supabase
    .from('departments')
    .select('id, name')
    .eq('key', deptKey)
    .single()

  if (!dept) return NextResponse.json({ error: 'Department not found' }, { status: 404 })

  const { data: agents } = await supabase
    .from('agents')
    .select('id, name, acronym, role_description')
    .eq('department_id', dept.id)

  if (!agents || agents.length === 0) return NextResponse.json({ error: 'No agents in department' }, { status: 404 })

  // 2. Build Router Prompt
  const routerPrompt = `
You are the routing system for the ${dept.name} department.
Given this brief: "${userBrief}"

Choose the best agent from this department to handle it:
${agents.map(a => `${a.name}: ${a.role_description}`).join('\n')}

Respond with ONLY the agent name. Nothing else.
`

  let selectedAgentName = '';
  let usedLLM = 'gemini';

  try {
    // Primary: Gemini
    const gemini = getGemini();
    const response = await gemini.invoke([new SystemMessage(routerPrompt)]);
    selectedAgentName = response.content.toString().trim();
  } catch (err) {
    console.error('Gemini routing failed, failing over to Groq:', err);
    try {
      // Secondary: Groq
      const groq = getGroq();
      const response = await groq.invoke([new SystemMessage(routerPrompt)]);
      selectedAgentName = response.content.toString().trim();
      usedLLM = 'groq';
    } catch (groqErr) {
      console.error('Groq routing failed too:', groqErr);
      return NextResponse.json({ error: 'Routing failed' }, { status: 500 });
    }
  }

  // 3. Match selected name back to Agent ID
  // Be flexible with matching (case-insensitive, contains)
  const matchedAgent = agents.find(a => 
    selectedAgentName.toLowerCase().includes(a.name.toLowerCase()) ||
    a.name.toLowerCase().includes(selectedAgentName.toLowerCase())
  ) || agents[0]; // Fallback to first agent if routing is unclear

  return NextResponse.json({ 
    agent: matchedAgent,
    routing_logic: usedLLM
  });
}
