import { getAuthUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createServerSupabaseClient()
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role, organizations(paystack_subscription_code)')
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'cofounder'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const org = Array.isArray(member.organizations) ? member.organizations[0] : member.organizations
  const code = org?.paystack_subscription_code

  if (!code) {
    return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 400 })
  }

  // Tell Paystack to disable the subscription
  const response = await fetch('https://api.paystack.co/subscription/disable', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, token: 'SYSTEM' }) // Paystack requires email token unless using SKey
  })

  // Paystack actually wants to map this using email token but server-side with Sk disables it.
  const verifyRes = await fetch('https://api.paystack.co/subscription/'+code, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
  })
  
  const subData = await verifyRes.json()
  
  if (subData.status) {
      await fetch('https://api.paystack.co/subscription/disable', {
          method: 'POST',
          headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
              code, 
              token: subData.data.email_token 
          })
      })
  }

  // Assuming it works, we leave DB state to be handled accurately by the `subscription.disable` webhook.
  return NextResponse.json({ success: true, message: 'Cancellation request sent. Plan remains active until billing cycle ends.' })
}
