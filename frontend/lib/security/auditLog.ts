import { createClient } from '@supabase/supabase-js'

export async function writeAuditLog({
  orgId,
  actorUserId,
  actorType = 'user',
  action,
  resourceType,
  resourceId,
  metadata = {},
  ipAddress,
}: {
  orgId: string
  actorUserId?: string
  actorType?: 'user' | 'agent' | 'system'
  action: string
  resourceType?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}) {
  // Use service role — audit log inserts are server-side only
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabase.from('audit_log').insert({
    org_id: orgId,
    actor_user_id: actorUserId,
    actor_type: actorType,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
    ip_address: ipAddress,
  })
}
