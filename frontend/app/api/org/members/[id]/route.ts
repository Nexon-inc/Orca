import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyOrgAccess } from '@/lib/security/orgGuard'
import { writeAuditLog } from '@/lib/security/auditLog'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: memberId } = await params;
  const supabase = await createServerSupabaseClient()

  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Get the target member's org and user_id before deletion
  const { data: memberToDelete } = await supabase
    .from('org_members')
    .select('org_id, user_id, role')
    .eq('id', memberId)
    .single()

  if (!memberToDelete) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  // 3. Verify requester is Owner or Co-founder of that org
  try {
    await verifyOrgAccess(user.id, memberToDelete.org_id, ['owner', 'cofounder'])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 })
  }

  // 4. Perform Deletion
  const { error: deleteError } = await supabase
    .from('org_members')
    .delete()
    .eq('id', memberId)

  if (deleteError) return NextResponse.json({ error: 'Deletion failed' }, { status: 500 })

  // 5. Revocation Blocklist
  await supabase.from('revoked_users').insert({
    user_id: memberToDelete.user_id,
    org_id: memberToDelete.org_id,
    revoked_by: user.id,
    reason: 'removed_from_org'
  })

  // 6. Force Sign Out via Admin API (Others)
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  await adminSupabase.auth.admin.signOut(memberToDelete.user_id, 'others')

  // 7. Audit Log
  await writeAuditLog({
    orgId: memberToDelete.org_id,
    actorUserId: user.id,
    action: 'member_removed',
    resourceType: 'user',
    resourceId: memberToDelete.user_id,
    metadata: { removed_member_id: memberId }
  })

  return NextResponse.json({ success: true })
}
