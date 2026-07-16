import { getAuthUser } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const supabase = createServerSupabaseClient();

  const { data: template, error } = await supabase
    .from('orcahub_templates')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  // Check if current org has it installed
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, organizations(plan)')
    .eq('user_id', user.id)
    .single();

  let isInstalled = false;
  let isAccessible = true;

  if (member) {
    const orgId = member.org_id;
    const orgPlan = (member.organizations as any)?.plan || 'free';

    const { data: install } = await supabase
      .from('orcahub_installs')
      .select('id')
      .eq('org_id', orgId)
      .eq('template_id', template.id)
      .single();

    if (install) isInstalled = true;

    const PLAN_ORDER = ['free', 'starter', 'pro', 'enterprise'];
    isAccessible = PLAN_ORDER.indexOf(orgPlan) >= PLAN_ORDER.indexOf(template.plan_required);
  }

  return NextResponse.json({
    ...template,
    is_installed: isInstalled,
    is_accessible: isAccessible
  });
}
