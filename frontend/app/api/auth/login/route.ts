'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const supabase = await createServerSupabaseClient()

  // Sign out any existing session first — clean slate
  await supabase.auth.signOut()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return NextResponse.json({ error: error.message }, { status: 401 })

  return NextResponse.json({ user: data.user })
}
