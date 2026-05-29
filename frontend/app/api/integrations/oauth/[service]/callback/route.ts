import { cookies } from 'next/headers'
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { getIntegrationConfig } from '@/lib/integrations/registry'
import { encryptToken } from '@/lib/security/encrypt'
import { writeAuditLog } from '@/lib/security/auditLog'
import {
  buildOAuthReturnUrl,
  OAUTH_RETURN_COOKIE,
  OAUTH_CTX_COOKIE,
} from '@/lib/integrations/oauthReturn'
import { NextResponse } from 'next/server'

function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
}

function redirectWithCookieClear(path: string, clearReturn = true, clearCtx = true) {
  const response = NextResponse.redirect(path)
  if (clearReturn) {
    response.cookies.set(OAUTH_RETURN_COOKIE, '', { path: '/', maxAge: 0 })
  }
  if (clearCtx) {
    response.cookies.set(OAUTH_CTX_COOKIE, '', { path: '/', maxAge: 0 })
  }
  return response
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const connectedAccountId =
    searchParams.get('connected_account_id') || searchParams.get('connectedAccountId')
  const oauthError = searchParams.get('error')
  const base = appBaseUrl()

  const cookieStore = await cookies()
  const returnPath = cookieStore.get(OAUTH_RETURN_COOKIE)?.value || null
  const ctxRaw = cookieStore.get(OAUTH_CTX_COOKIE)?.value

  let ctx: { userId?: string; orgId?: string; service?: string } | null = null
  if (ctxRaw) {
    try {
      ctx = JSON.parse(ctxRaw)
    } catch {
      ctx = null
    }
  }

  const fail = (error: string, toolkit?: string) =>
    redirectWithCookieClear(
      buildOAuthReturnUrl(base, returnPath, { error, service, toolkit })
    )

  if (oauthError || status === 'failed') {
    return fail('denied')
  }

  if (!connectedAccountId) {
    return fail('invalid_connection')
  }

  const config = getIntegrationConfig(service)
  if (!config) {
    return fail('unknown_service')
  }

  // Prefer live session; fall back to OAuth context cookie (session often lost after provider redirect)
  const sessionUser = await getAuthUser()
  let userId = sessionUser?.id
  let orgId: string | undefined

  if (sessionUser) {
    const supabase = await createServerSupabaseClient()
    const { data: member } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', sessionUser.id)
      .single()
    orgId = member?.org_id
  }

  if ((!userId || !orgId) && ctx?.service === service && ctx.userId && ctx.orgId) {
    userId = ctx.userId
    orgId = ctx.orgId
  }

  if (!userId || !orgId) {
    const loginUrl = new URL('/auth/login', base)
    loginUrl.searchParams.set('return_to', `/api/integrations/oauth/${service}/callback?${searchParams.toString()}`)
    return redirectWithCookieClear(loginUrl.toString(), false, false)
  }

  try {
    const serviceClient = createServiceSupabaseClient()
    const { error: upsertErr } = await serviceClient.from('integrations').upsert(
      {
        org_id: orgId,
        service_name: service,
        department_key: config.department_key,
        status: 'connected',
        access_token_encrypted: encryptToken(connectedAccountId),
        metadata: { auth_type: 'composio', connected_account_id: connectedAccountId },
        connected_at: new Date().toISOString(),
      },
      { onConflict: 'org_id,service_name' }
    )

    if (upsertErr) {
      console.error('[OAUTH_CALLBACK] upsert failed:', upsertErr.message)
      return fail('save_failed')
    }

    await writeAuditLog({
      orgId,
      actorUserId: userId,
      action: 'integration_connected',
      resourceType: 'integration',
      metadata: { service, dept: config.department_key, auth_type: 'composio' },
    }).catch((err) => console.error('[OAUTH_CALLBACK] audit log failed:', err))

    return redirectWithCookieClear(
      buildOAuthReturnUrl(base, returnPath, { success: true, service })
    )
  } catch (err: unknown) {
    console.error('[OAUTH_CALLBACK] exception:', err)
    return fail('callback_exception')
  }
}
