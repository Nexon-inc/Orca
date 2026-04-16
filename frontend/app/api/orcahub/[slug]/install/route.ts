import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { writeAuditLog } from '@/lib/security/auditLog';
import { AGENT_ROSTER } from '@/lib/agents';

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
    .single();

  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  const PLAN_ORDER = ['free', 'starter', 'pro', 'enterprise'];
  if (PLAN_ORDER.indexOf(orgPlan) < PLAN_ORDER.indexOf(template.plan_required)) {
    return NextResponse.json({
      error: `This template requires the ${template.plan_required} plan or higher`
    }, { status: 403 });
  }

  const templateData = template.template_data;

  // 1. Install Departments & Executives
  for (const deptKey of templateData.departments) {
    const { data: dept } = await supabase.from('departments').upsert({
      org_id: orgId,
      key: deptKey,
      name: deptKey.charAt(0).toUpperCase() + deptKey.slice(1),
      icon: getDeptIcon(deptKey),
      agent_mode: 'approve_first',
    }, { onConflict: 'org_id,key' }).select('id').single();

    if (dept) {
      // Find respective executive in roster
      const exec = AGENT_ROSTER.find(a => a.dept === deptKey);
      if (exec) {
        await supabase.from('agents').upsert({
          department_id: dept.id,
          name: exec.name,
          icon: exec.icon,
          acronym: exec.id.substring(0, 2).toUpperCase(),
          role_description: exec.description,
          status: 'idle'
        }, { onConflict: 'department_id,name' });
      }
    }
  }

  // 2. Initialisation Check
  const { data: identity } = await supabase
    .from('company_identity')
    .select('mission')
    .eq('org_id', orgId)
    .single();

  const needsOnboarding = !identity || !identity.mission;

  // 3. System Notification
  await supabase.from('team_messages').insert({
    org_id: orgId,
    from_user_id: user.id,
    to_user_id: user.id,
    content: `SYSTEM_DEPLOYMENT: ${template.name} has been successfully installed. Core executives are now standing by.`,
    is_system_notification: true
  });

  await writeAuditLog({
    orgId,
    actorUserId: user.id,
    action: 'orcahub_template_installed',
    metadata: { template_slug: params.slug, needs_onboarding: needsOnboarding }
  });

  return NextResponse.json({ 
    success: true, 
    onboarding_required: needsOnboarding 
  });
}

function getDeptIcon(key: string): string {
  const icons: Record<string, string> = {
    marketing: '📣',
    sales: '💼',
    cs: '🤝',
    tech: '🛡️',
    ops: '📋',
    intel: '🔍'
  };
  return icons[key] || '⚙️';
}
