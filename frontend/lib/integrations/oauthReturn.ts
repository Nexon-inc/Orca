import { NextResponse } from 'next/server'

export const OAUTH_RETURN_COOKIE = 'orca_oauth_return'

export function sanitizeReturnPath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return null
  return path
}

export function buildOAuthReturnUrl(
  appUrl: string,
  returnPath: string | null,
  params: { success?: boolean; service?: string; error?: string; toolkit?: string }
): string {
  const base = sanitizeReturnPath(returnPath) || '/dashboard/integrations'
  const url = new URL(base, appUrl)

  if (params.success && params.service) {
    url.searchParams.set('success', 'true')
    url.searchParams.set('service', params.service)
  }
  if (params.error) {
    url.searchParams.set('error', params.error)
    if (params.service) url.searchParams.set('service', params.service)
    if (params.toolkit) url.searchParams.set('toolkit', params.toolkit)
  }

  return url.toString()
}

export function setOAuthReturnCookie(response: NextResponse, returnPath: string | null) {
  const safe = sanitizeReturnPath(returnPath)
  if (!safe) return
  response.cookies.set(OAUTH_RETURN_COOKIE, safe, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
}

export function getOAuthConnectUrl(serviceKey: string, returnPath?: string): string {
  const path =
    typeof window !== 'undefined'
      ? returnPath || `${window.location.pathname}${window.location.search}`
      : returnPath || '/dashboard/integrations'
  return `/api/integrations/oauth/${serviceKey}/initiate?return_to=${encodeURIComponent(path)}`
}
