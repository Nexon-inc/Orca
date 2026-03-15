'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { getIntegrationConfig } from '@/lib/integrations/registry'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = getIntegrationConfig(service)
  if (!config || config.auth_method !== 'oauth') {
    return NextResponse.json({ error: 'Integration not found or not OAuth' }, { status: 404 })
  }

  const state = crypto.randomBytes(16).toString('hex')
  const supabase = await createServerSupabaseClient()

  await supabase.from('oauth_states').upsert({
    user_id: user.id,
    service_key: service,
    state,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  })

  const clientId = process.env[config.oauth_client_id_env!]
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/oauth/${service}/callback`

  const qs = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.oauth_scopes?.join(' ') ?? '',
    state,
  })

  return NextResponse.redirect(`${config.oauth_authorize_url}?${qs.toString()}`)
}
