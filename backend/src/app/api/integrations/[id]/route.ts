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

  // Get the integration to confirm org ownership
  const { data: integration } = await supabase
    .from('integrations')
    .select('org_id, service_name, department_key')
    .eq('id', id)
    .single()

  if (!integration) {
    return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
  }

  // Verify the user belongs to this org
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role')
    .eq('user_id', user.id)
    .eq('org_id', integration.org_id)
    .single()

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Only owners, cofounders, and heads (of that dept) can disconnect
  const canDisconnect = ['owner', 'cofounder'].includes(member.role)
  if (!canDisconnect) {
    return NextResponse.json(
      { error: 'Only Owners and Co-founders can disconnect integrations.' },
      { status: 403 }
    )
  }

  // Delete the integration record (tokens are deleted with it)
  await supabase.from('integrations').delete().eq('id', id)

  await writeAuditLog({
    orgId: integration.org_id,
    actorUserId: user.id,
    action: 'integration_disconnected',
    resourceType: 'integration',
    metadata: { service: integration.service_name, dept: integration.department_key }
  })

  return NextResponse.json({ disconnected: true })
}
