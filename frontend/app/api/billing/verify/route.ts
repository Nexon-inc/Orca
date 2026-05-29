import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
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
  const plan = meta.plan || 'builder'
  const isFounding = meta.founding === true || meta.founding === 'true'

  if (!orgId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&error=missing_org`
    )
  }

  const supabase = await createServerSupabaseClient()
  const service = createServiceSupabaseClient()
  const user = await getAuthUser()

  await supabase.from('organizations').update({
    plan,
    paystack_subscription_code: data.plan_object?.subscription_code || data.subscription?.subscription_code || null,
    plan_expires_at: null,
    checkout_locked_at: null,
    checkout_locked_by: null,
  }).eq('id', orgId)

  if (isFounding && user) {
    const { data: config } = await service.from('founding_config').select('id, spots_taken, total_spots').limit(1).maybeSingle()
    if (config) {
      const spotNumber = (config.spots_taken ?? 0) + 1
      await service.from('founding_members').insert({
        user_id: user.id,
        org_id: orgId,
        spot_number: spotNumber,
        locked_price: 19,
      })
      await service.from('founding_config').update({
        spots_taken: spotNumber,
        updated_at: new Date().toISOString(),
      }).eq('id', config.id)
    }
  }

  const successPlan = isFounding ? 'founding_builder' : plan
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=billing&success=true&plan=${successPlan}`
  )
}
