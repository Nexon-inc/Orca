'use server'
import { getAuthUser } from '@/lib/auth'
import { getIntegrationConfig } from '@/lib/integrations/registry'
import { NextResponse } from 'next/server'

const COMPOSIO_SLUG_MAP: Record<string, string> = {
  linkedin: 'linkedin',
  twitter: 'twitter',
  meta: 'facebook',
  google: 'gmail',
  hubspot: 'hubspot',
  slack: 'slack',
  notion: 'notion',
  github: 'github',
  tiktok: 'tiktok',
  google_drive: 'googledrive',
  gmail_outreach: 'gmail',
  google_calendar: 'googlecalendar',
}

function envAuthConfigId(service: string): string | undefined {
  const serviceKey = service.toUpperCase().replace(/-/g, '_')
  return (
    process.env[`COMPOSIO_AUTH_CONFIG_${serviceKey}`] ||
    process.env[`COMPOSIO_AUTH_CONFIG_${COMPOSIO_SLUG_MAP[service]?.toUpperCase().replace(/-/g, '_')}`]
  )
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = getIntegrationConfig(service)
  if (!config) {
    return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
  }

  const composioSlug = COMPOSIO_SLUG_MAP[service] || service
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

  if (!process.env.COMPOSIO_API_KEY) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/integrations?error=composio_missing_api_key&service=${service}`
    )
  }

  try {
    let authConfigId = envAuthConfigId(service)

    if (!authConfigId) {
      const configRes = await fetch(
        `https://backend.composio.dev/api/v3/auth_configs?toolkit_slug=${encodeURIComponent(composioSlug)}`,
        { headers: { 'x-api-key': process.env.COMPOSIO_API_KEY } }
      )

      if (!configRes.ok) {
        const errText = await configRes.text().catch(() => '')
        console.error('[COMPOSIO] auth_configs failed:', composioSlug, configRes.status, errText)
        return NextResponse.redirect(
          `${appUrl}/dashboard/integrations?error=composio_api_error&service=${service}`
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
        `${appUrl}/dashboard/integrations?error=no_composio_auth_config&service=${service}&toolkit=${composioSlug}`
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
        `${appUrl}/dashboard/integrations?error=composio_link_failed&service=${service}`
      )
    }

    const linkData = await linkRes.json()
    const redirectUrl = linkData.redirectUrl || linkData.redirect_url

    if (!redirectUrl) {
      return NextResponse.redirect(
        `${appUrl}/dashboard/integrations?error=no_redirect_url&service=${service}`
      )
    }

    return NextResponse.redirect(redirectUrl)
  } catch (err: unknown) {
    console.error('[COMPOSIO] connect exception:', err)
    return NextResponse.redirect(
      `${appUrl}/dashboard/integrations?error=composio_connect_exception&service=${service}`
    )
  }
}
