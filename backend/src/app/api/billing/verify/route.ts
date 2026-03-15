import { createServerSupabaseClient } from '@/lib/supabase/server'
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
    return NextResponse.json({ error: 'Payment not successful' }, { status: 400 })
  }

  const { org_id, plan } = data.metadata
  const supabase = await createServerSupabaseClient()

  await supabase.from('organizations').update({
    plan,
    paystack_subscription_code: data.plan_object?.subscription_code || null,
    plan_expires_at: null,
  }).eq('id', org_id)

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/account?tab=billing&success=true`)
}
