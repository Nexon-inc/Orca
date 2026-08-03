import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createServiceSupabaseClient } from '@/lib/supabase/service';
import { loadBCP, applyBCPUpdates, renderBCPasMarkdown } from '@/lib/lunar/bcpManager';
import { buildLunarSystemPrompt } from '@/lib/lunar/prompt';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createServerSupabaseClient();
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, organizations(name)')
    .eq('user_id', user.id)
    .single();

  if (!member?.org_id) {
    return NextResponse.json({ error: 'No organization workspace found' }, { status: 400 });
  }

  const orgId = member.org_id;
  const orgName = (member as any).organizations?.name || 'Company';

  const body = await request.json();
  const messages = body.messages || [];
  const lastUserMessage = messages[messages.length - 1]?.content || body.prompt || '';

  // 1. Load BCP
  let bcp = await loadBCP(orgId);

  // Special command check
  if (lastUserMessage.toLowerCase().trim().includes('show my bcp')) {
    const markdown = renderBCPasMarkdown(bcp!);
    return NextResponse.json({
      role: 'assistant',
      content: markdown,
      score: bcp?.onboarding_score || 0,
    });
  }

  // 2. Build system prompt
  const systemPrompt = buildLunarSystemPrompt(bcp, orgName);

  // 3. Call LLM
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: String(m.content),
        })),
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply = completion.choices[0]?.message?.content || 'I am updating your business protocol context.';

    // 4. Extract BCP Updates
    const updateRegex = /\[BCP_UPDATE:\s*({[\s\S]+?})\]/g;
    const updates: any[] = [];
    let match;

    while ((match = updateRegex.exec(reply)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        updates.push(parsed);
      } catch (err) {
        console.error('[BCP_PARSE_ERROR]', err);
      }
    }

    if (updates.length > 0) {
      bcp = await applyBCPUpdates(orgId, updates);
    }

    // 5. Save to lunar_conversations
    const serviceSupabase = createServiceSupabaseClient();
    await serviceSupabase.from('lunar_conversations').insert({
      org_id: orgId,
      user_message: lastUserMessage,
      lunar_response: reply,
      bcp_updates: updates.length,
    });

    // Clean reply for user display
    const cleanReply = reply.replace(/\[BCP_UPDATE:[\s\S]+?\]/g, '').trim();

    return NextResponse.json({
      role: 'assistant',
      content: cleanReply,
      score: bcp?.onboarding_score || 10,
      bcpUpdatesCount: updates.length,
    });

  } catch (err: any) {
    console.error('[LUNAR_API_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Lunar AI service error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createServerSupabaseClient();
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single();

  if (!member?.org_id) return NextResponse.json({ error: 'No workspace found' }, { status: 400 });

  const bcp = await loadBCP(member.org_id);
  return NextResponse.json({ bcp, score: bcp?.onboarding_score || 0 });
}
