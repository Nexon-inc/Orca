'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { getIntegrationConfig } from '@/lib/integrations/registry'
import { encryptToken } from '@/lib/security/encrypt'
import { writeAuditLog } from '@/lib/security/auditLog'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const connectedAccountId = searchParams.get('connected_account_id') || searchParams.get('connectedAccountId')
  const oauthError = searchParams.get('error')
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL

  if (oauthError || status === 'failed') {
    return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=denied&service=${service}`)
  }
  
  if (!connectedAccountId) {
    return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=invalid_connection`)
  }

  const user = await getAuthUser()
  if (!user) return NextResponse.redirect(`${APP_URL}/login`)

  const supabase = await createServerSupabaseClient()
  const config = getIntegrationConfig(service)
  if (!config) return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=unknown_service`)

  const { data: member } = await supabase.from('org_members').select('org_id').eq('user_id', user.id).single()
  if (!member) return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=no_org`)
  const orgId = member.org_id

  await supabase.from('integrations').upsert({
    org_id: orgId,
    service_name: service,
    department_key: config.department_key,
    status: 'connected',
    access_token_encrypted: encryptToken(connectedAccountId),
    metadata: { auth_type: 'composio', connected_account_id: connectedAccountId },
    connected_at: new Date().toISOString(),
  }, { onConflict: 'org_id,service_name' })

  await writeAuditLog({
    orgId,
    actorUserId: user.id,
    action: 'integration_connected',
    resourceType: 'integration',
    metadata: { service, dept: config.department_key, auth_type: 'composio' },
  })

  return NextResponse.redirect(`${APP_URL}/dashboard/integrations?success=true&service=${service}`)
}
