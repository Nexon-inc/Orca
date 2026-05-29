'use server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { getIntegrationConfig } from '@/lib/integrations/registry'
import { encryptToken } from '@/lib/security/encrypt'
import { writeAuditLog } from '@/lib/security/auditLog'
import {
  OAUTH_RETURN_COOKIE,
  buildOAuthReturnUrl,
  sanitizeReturnPath,
} from '@/lib/integrations/oauthReturn'
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
  const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')
  const cookieStore = cookies()
  const returnPath = sanitizeReturnPath(cookieStore.get(OAUTH_RETURN_COOKIE)?.value)

  const finish = (target: string) => {
    const response = NextResponse.redirect(target)
    response.cookies.delete(OAUTH_RETURN_COOKIE)
    return response
  }

  if (oauthError || status === 'failed') {
    return finish(buildOAuthReturnUrl(APP_URL, returnPath, { error: 'denied', service }))
  }

  if (!connectedAccountId) {
    return finish(buildOAuthReturnUrl(APP_URL, returnPath, { error: 'invalid_connection', service }))
  }

  const user = await getAuthUser()
  if (!user) return NextResponse.redirect(`${APP_URL}/login`)

  const supabase = await createServerSupabaseClient()
  const config = getIntegrationConfig(service)
  if (!config) {
    return finish(buildOAuthReturnUrl(APP_URL, returnPath, { error: 'unknown_service', service }))
  }

  const { data: member } = await supabase.from('org_members').select('org_id').eq('user_id', user.id).single()
  if (!member) {
    return finish(buildOAuthReturnUrl(APP_URL, returnPath, { error: 'no_org', service }))
  }
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

  return finish(buildOAuthReturnUrl(APP_URL, returnPath, { success: true, service }))
}
