import { getAuthUser } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const briefText = body.brief_text; 

  if (!briefText) {
    return NextResponse.json({ error: 'Missing brief text' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single();

  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const orgId = member.org_id;

  // 1. Get the pending brief
  const { data: brief, error: briefErr } = await supabase
    .from('pending_briefs')
    .select('*, agents(id, department_key)')
    .eq('id', id)
    .eq('org_id', orgId)
    .single();

  if (briefErr || !brief) {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
  }

  const agentId = brief.agent_id;
  const deptKey = (brief.agents as any)?.department_key;

  // 2. See if active conversation exists for this agent
  let { data: conv } = await supabase
    .from('conversations')
    .select('id')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .eq('agent_id', agentId)
    .eq('status', 'active')
    .single();

  let conversationId = conv?.id;

  // 3. Create conversation if it doesn't exist
  if (!conversationId) {
    const { data: newConv } = await supabase
      .from('conversations')
      .insert({
        org_id: orgId,
        user_id: user.id,
        agent_id: agentId,
        department_key: deptKey,
        status: 'active'
      })
      .select('id')
      .single();
    
    conversationId = newConv?.id;
  }

  // 4. Insert the brief as a user message
  if (conversationId) {
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      sender_type: 'user',
      content: briefText,
    });

    // Note: Here you would normally trigger the AI processing pipeline via an edge function, webhook, or queue
    // For now, we simulate an AI receipt/acknowledgment.
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: agentId,
      sender_type: 'agent',
      content: "Received your brief. I am processing this request based on the templates constraints immediately.",
      status: 'approved'
    });
  }

  // 5. Mark brief as sent
  await supabase
    .from('pending_briefs')
    .update({ sent: true, sent_at: new Date().toISOString() })
    .eq('id', id);

  return NextResponse.json({ success: true, conversation_id: conversationId });
}
