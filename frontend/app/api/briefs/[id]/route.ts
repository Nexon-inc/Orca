import { getAuthUser } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const supabase = await createServerSupabaseClient();

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (body.dismissed === true) {
    await supabase
      .from('pending_briefs')
      .update({ dismissed: true })
      .eq('id', id)
      .eq('org_id', member.org_id);
      
    return NextResponse.json({ success: true, action: 'dismissed' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
