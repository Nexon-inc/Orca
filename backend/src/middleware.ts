import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // 1. Session Revocation Check (Phase 9)
  if (session) {
    const { data: revoked } = await supabase
      .from('revoked_users')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (revoked) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=revoked', request.url))
    }
  }

  if (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/onboarding')
  ) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (['/login', '/signup'].includes(request.nextUrl.pathname)) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/login', '/signup'],
}
