'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, name, company, biggest_bottleneck, department_needed, referral_source } = await request.json()

  if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 })

  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.from('waitlist').insert({
    email,
    name: name ?? null,
    company: company ?? null,
    biggest_bottleneck: biggest_bottleneck ?? null,
    department_needed: department_needed ?? null,
    referral_source: referral_source ?? null,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You are already on the waitlist.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
