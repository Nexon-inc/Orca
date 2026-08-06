import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/security/auditLog'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Only owners, cofounders, and heads can disconnect
  const canDisconnect = ['owner', 'cofounder', 'head'].includes(member.role)
  if (!canDisconnect) {
    return NextResponse.json(
      { error: 'Only Owners, Co-founders, and Department Heads can disconnect integrations.' },
      { status: 403 }
    )
  }

  // Delete the integration record by UUID id or service_name
  const { data: deleted, error: deleteErr } = await supabase
    .from('integrations')
    .delete()
    .eq('org_id', member.org_id)
    .or(`id.eq.${id},service_name.eq.${id}`)
    .select('id, service_name, department_key')

  if (deleteErr) {
    console.error('[DELETE_INTEGRATION_ERR]', deleteErr)
    return NextResponse.json({ error: deleteErr.message }, { status: 500 })
  }

  await writeAuditLog({
    orgId: member.org_id,
    actorUserId: user.id,
    action: 'integration_disconnected',
    resourceType: 'integration',
    metadata: { targetId: id, deletedCount: deleted?.length || 0 }
  })

  return NextResponse.json({ disconnected: true })
}
