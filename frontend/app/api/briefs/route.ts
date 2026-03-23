import { getAuthUser } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createServerSupabaseClient();

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Not in an organization' }, { status: 403 });
  }

  // Fetch pending briefs
  const { data: briefs } = await supabase
    .from('pending_briefs')
    .select(`
      id,
      brief_text,
      rationale,
      template_slug,
      created_at,
      agents (
        id,
        name,
        icon,
        department_key
      )
    `)
    .eq('org_id', member.org_id)
    .eq('sent', false)
    .eq('dismissed', false)
    .order('created_at', { ascending: true });

  return NextResponse.json({ briefs });
}
