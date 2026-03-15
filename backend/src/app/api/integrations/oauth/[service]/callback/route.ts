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
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error')
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL

  if (oauthError) return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=denied&service=${service}`)
  if (!code || !state) return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=invalid`)

  const user = await getAuthUser()
  if (!user) return NextResponse.redirect(`${APP_URL}/login`)

  const supabase = await createServerSupabaseClient()
  const config = getIntegrationConfig(service)
  if (!config) return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=unknown_service`)

  const { data: oauthState } = await supabase
    .from('oauth_states')
    .select('*')
    .eq('user_id', user.id)
    .eq('service_key', service)
    .eq('state', state)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!oauthState) return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=state_mismatch`)

  const redirectUri = `${APP_URL}/api/integrations/oauth/${service}/callback`
  const clientId = process.env[config.oauth_client_id_env!]
  const clientSecret = process.env[config.oauth_client_secret_env!]

  const tokenResponse = await fetch(config.oauth_token_url!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId!,
      client_secret: clientSecret!,
    }).toString(),
  })

  const tokenData = await tokenResponse.json()
  if (!tokenData.access_token) {
    return NextResponse.redirect(`${APP_URL}/dashboard/integrations?error=token_exchange_failed`)
  }

  const { data: member } = await supabase.from('org_members').select('org_id').eq('user_id', user.id).single()
  const orgId = member!.org_id

  await supabase.from('integrations').upsert({
    org_id: orgId,
    service_name: service,
    department_key: config.department_key,
    status: 'connected',
    access_token_encrypted: encryptToken(tokenData.access_token),
    refresh_token_encrypted: tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null,
    metadata: { scope: tokenData.scope, token_type: tokenData.token_type, expires_in: tokenData.expires_in },
    connected_at: new Date().toISOString(),
  }, { onConflict: 'org_id,service_name' })

  await supabase.from('oauth_states').delete().eq('user_id', user.id).eq('service_key', service)

  await writeAuditLog({
    orgId,
    actorUserId: user.id,
    action: 'integration_connected',
    resourceType: 'integration',
    metadata: { service, dept: config.department_key },
  })

  return NextResponse.redirect(`${APP_URL}/dashboard/integrations?success=true&service=${service}`)
}
