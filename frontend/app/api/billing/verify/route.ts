import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { recordFoundingMember } from '@/lib/billing/founding'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')
  if (!reference) return NextResponse.json({ error: 'No reference' }, { status: 400 })

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    }
  )

  const { data, status } = await response.json()
  if (!status || data.status !== 'success') {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&error=payment_failed`
    )
  }

  const meta = data.metadata || {}
  const orgId = meta.org_id
  const isFounding = meta.founding === true || meta.founding === 'true'
  const plan = isFounding ? 'founding_builder' : (meta.plan || 'builder')

  if (!orgId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&error=missing_org`
    )
  }

  const supabase = await createServerSupabaseClient()
  const user = await getAuthUser()

  await supabase.from('organizations').update({
    plan,
    paystack_subscription_code: data.plan_object?.subscription_code || data.subscription?.subscription_code || null,
    plan_expires_at: null,
    checkout_locked_at: null,
    checkout_locked_by: null,
  }).eq('id', orgId)

  if (isFounding && user) {
    await recordFoundingMember(orgId, user.id)
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&success=true&plan=${plan}`
  )
}
