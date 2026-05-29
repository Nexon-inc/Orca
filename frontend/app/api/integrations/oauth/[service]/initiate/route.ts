'use server'
import { getAuthUser } from '@/lib/auth'
import { getComposioSlug, getCatalogTool } from '@/lib/integrations/catalog'
import { getIntegrationConfig } from '@/lib/integrations/registry'
import {
  buildOAuthReturnUrl,
  sanitizeReturnPath,
  setOAuthReturnCookie,
} from '@/lib/integrations/oauthReturn'
import { NextResponse } from 'next/server'

function envAuthConfigId(service: string, composioSlug: string): string | undefined {
  const serviceKey = service.toUpperCase().replace(/-/g, '_')
  const slugKey = composioSlug.toUpperCase().replace(/-/g, '_')
  return (
    process.env[`COMPOSIO_AUTH_CONFIG_${serviceKey}`] ||
    process.env[`COMPOSIO_AUTH_CONFIG_${slugKey}`]
  )
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params
  const { searchParams } = new URL(request.url)
  const returnTo = sanitizeReturnPath(searchParams.get('return_to'))
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = getIntegrationConfig(service)
  if (!config) {
    return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
  }

  const catalogTool = getCatalogTool(service)
  const composioSlug = catalogTool?.composio_slug || getComposioSlug(service)
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')

  if (!process.env.COMPOSIO_API_KEY) {
    return NextResponse.redirect(
      buildOAuthReturnUrl(appUrl, returnTo, { error: 'composio_missing_api_key', service })
    )
  }

  try {
    let authConfigId = envAuthConfigId(service, composioSlug)

    if (!authConfigId) {
      const configRes = await fetch(
        `https://backend.composio.dev/api/v3/auth_configs?toolkit_slug=${encodeURIComponent(composioSlug)}`,
        { headers: { 'x-api-key': process.env.COMPOSIO_API_KEY } }
      )

      if (!configRes.ok) {
        const errText = await configRes.text().catch(() => '')
        console.error('[COMPOSIO] auth_configs failed:', composioSlug, configRes.status, errText)
        return NextResponse.redirect(
          buildOAuthReturnUrl(appUrl, returnTo, {
            error: 'composio_api_error',
            service,
            toolkit: composioSlug,
          })
        )
      }

      const configData = await configRes.json()
      const configs = configData.items ?? configData.data ?? configData
      const authConfig = Array.isArray(configs)
        ? configs[0]
        : configs.items?.[0] ?? configs.data?.[0]

      authConfigId = authConfig?.id
    }

    if (!authConfigId) {
      console.error('[COMPOSIO] No auth config for toolkit:', composioSlug, service)
      return NextResponse.redirect(
        buildOAuthReturnUrl(appUrl, returnTo, {
          error: 'no_composio_auth_config',
          service,
          toolkit: composioSlug,
        })
      )
    }

    const redirectUri = `${appUrl}/api/integrations/oauth/${service}/callback`
    const linkRes = await fetch('https://backend.composio.dev/api/v3/connected_accounts/link', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.COMPOSIO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_config_id: authConfigId,
        user_id: user.id,
        callback_url: redirectUri,
      }),
    })

    if (!linkRes.ok) {
      const errText = await linkRes.text().catch(() => '')
      console.error('[COMPOSIO] link failed:', linkRes.status, errText)
      return NextResponse.redirect(
        buildOAuthReturnUrl(appUrl, returnTo, { error: 'composio_link_failed', service })
      )
    }

    const linkData = await linkRes.json()
    const redirectUrl = linkData.redirectUrl || linkData.redirect_url

    if (!redirectUrl) {
      return NextResponse.redirect(
        buildOAuthReturnUrl(appUrl, returnTo, { error: 'no_redirect_url', service })
      )
    }

    const response = NextResponse.redirect(redirectUrl)
    setOAuthReturnCookie(response, returnTo)
    return response
  } catch (err: unknown) {
    console.error('[COMPOSIO] connect exception:', err)
    return NextResponse.redirect(
      buildOAuthReturnUrl(appUrl, returnTo, { error: 'composio_connect_exception', service })
    )
  }
}
