import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { writeAuditLog } from '@/lib/security/auditLog';

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role, organizations(plan)')
    .eq('user_id', user.id)
    .single();

  if (!member || !['owner', 'cofounder'].includes(member.role)) {
    return NextResponse.json({ error: 'Only owners and co-founders can install templates' }, { status: 403 });
  }

  const orgId = member.org_id;
  const orgPlan = (member.organizations as any).plan;

  const { data: template } = await supabase
    .from('orcahub_templates')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single();

  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  const PLAN_ORDER = ['free', 'starter', 'pro', 'enterprise'];
  if (PLAN_ORDER.indexOf(orgPlan) < PLAN_ORDER.indexOf(template.plan_required)) {
    return NextResponse.json({
      error: `This template requires the ${template.plan_required} plan or higher`
    }, { status: 403 });
  }

  const templateData = template.template_data;

  // 1. Activate departments
  for (const deptConfig of templateData.departments) {
    await supabase.from('departments').upsert({
      org_id: orgId,
      key: deptConfig.key,
      icon: getDeptIcon(deptConfig.key), // Helper to be added
      agent_mode: deptConfig.agent_mode,
    }, { onConflict: 'org_id,key' });
  }

  // 2. Queue Day 1 Briefs
  for (const brief of templateData.day1_briefs) {
    const { data: agent } = await supabase
      .from('agents')
      .select('id')
      .eq('org_id', orgId)
      .eq('name', brief.agent_name)
      .single();

    if (agent) {
      await supabase.from('pending_briefs').insert({
        org_id: orgId,
        agent_id: agent.id,
        brief_text: brief.brief,
        rationale: brief.rationale,
        source: 'orcahub',
        template_slug: params.slug,
      });
    }
  }

  // 3. Mark install & increment
  await supabase.from('orcahub_installs').insert({
    org_id: orgId,
    template_id: template.id,
    installed_by: user.id,
  });

  await supabase.rpc('increment_template_installs', { p_template_id: template.id });

  await writeAuditLog({
    orgId,
    actorUserId: user.id,
    action: 'orcahub_template_installed',
    metadata: { template_slug: params.slug, template_name: template.name }
  });

  return NextResponse.json({ success: true });
}

function getDeptIcon(key: string): string {
  const icons: Record<string, string> = {
    marketing: '📣',
    sales: '💼',
    cs: '🤝',
    tech: '🛡️',
    hiring: '🧠',
    ops: '📋',
    finance: '📊',
    intel: '🔍',
    community: '🌐'
  };
  return icons[key] || '⚙️';
}
