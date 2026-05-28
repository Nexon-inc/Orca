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
  if (!config) {
    return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
  }

  const composioSlugMap: Record<string, string> = {
    linkedin: 'linkedin',
    twitter: 'twitter',
    meta: 'facebook',
    google: 'gmail',
    hubspot: 'hubspot',
    slack: 'slack',
    notion: 'notion',
    github: 'github',
    tiktok: 'tiktok',
    google_drive: 'google-drive',
    gmail_outreach: 'gmail',
    google_calendar: 'google-calendar',
  }
  const composioSlug = composioSlugMap[service] || service

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

    // 1. Fetch auth config ID from Composio
    const configRes = await fetch(`https://backend.composio.dev/api/v3.1/auth_configs?toolkit_slug=${composioSlug}`, {
      headers: { 'x-api-key': process.env.COMPOSIO_API_KEY! }
    })
    
    if (!configRes.ok) {
      return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=composio_api_error&service=${service}`)
    }

    const configData = await configRes.json()
    const configs = configData.items || configData.data || configData
    const authConfig = Array.isArray(configs) ? configs[0] : (configs.items?.[0] || configs.data?.[0])

    if (!authConfig?.id) {
      return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=no_composio_auth_config&service=${service}`)
    }

    // 2. Generate link session
    const redirectUri = `${appUrl}/api/integrations/oauth/${service}/callback`
    const linkRes = await fetch('https://backend.composio.dev/api/v3/connected_accounts/link', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.COMPOSIO_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        auth_config_id: authConfig.id,
        user_id: user.id,
        callback_url: redirectUri
      })
    })

    if (!linkRes.ok) {
      return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=composio_link_failed&service=${service}`)
    }

    const linkData = await linkRes.json()
    const redirectUrl = linkData.redirectUrl || linkData.redirect_url

    if (!redirectUrl) {
      return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=no_redirect_url&service=${service}`)
    }

    return NextResponse.redirect(redirectUrl)
  } catch (err: any) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=composio_connect_exception&service=${service}`)
  }
}
