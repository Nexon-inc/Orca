'use server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { emailTemplates, resend } from '@/lib/email/resend'
import { writeAuditLog } from '@/lib/security/auditLog'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest('hex')

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const supabase = createServiceSupabaseClient()

  // 1. Idempotency Check
  const reference = event.data.reference || event.data.id
  if (reference) {
    const { data: alreadyProcessed } = await supabase
      .from('processed_webhook_events')
      .select('id')
      .eq('provider', 'paystack')
      .eq('event_reference', reference)
      .maybeSingle()

    if (alreadyProcessed) {
      return NextResponse.json({ received: true, duplicate: true })
    }
  }

  if (event.event === 'charge.success') {
    const meta = event.data.metadata
    const orgId = meta?.org_id
    const plan = meta?.plan || 'builder'
    const userId = meta?.user_id
    const isFounding = meta?.founding === true || meta?.founding === 'true'

    if (!orgId || !plan) return NextResponse.json({ received: true })

    await supabase.from('organizations').update({
      plan,
      paystack_customer_code: event.data.customer?.customer_code ?? null,
      paystack_subscription_code: event.data.subscription_code ?? null,
      checkout_locked_at: null,
      checkout_locked_by: null,
      updated_at: new Date().toISOString(),
    }).eq('id', orgId)

    if (isFounding && userId) {
      const { data: config } = await supabase.from('founding_config').select('id, spots_taken').limit(1).maybeSingle()
      if (config) {
        const spotNumber = (config.spots_taken ?? 0) + 1
        await supabase.from('founding_members').insert({
          user_id: userId,
          org_id: orgId,
          spot_number: spotNumber,
          locked_price: 19,
        })
        await supabase.from('founding_config').update({
          spots_taken: spotNumber,
          updated_at: new Date().toISOString(),
        }).eq('id', config.id)
      }
    }

    // Mark as processed
    if (reference) {
      await supabase.from('processed_webhook_events').insert({
        provider: 'paystack',
        event_reference: reference,
        event_type: event.event,
      })
    }

    // Revalidate dashboard paths
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/dashboard', 'layout')

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single()

    if (profile?.email) {
      const template = emailTemplates.planUpgraded(profile.full_name ?? 'there', plan)
      await resend.emails.send({
        from: 'ORCA <noreply@nexonic.com>',
        to: profile.email,
        subject: template.subject,
        html: template.html,
      })
    }

    await writeAuditLog({
      orgId,
      actorUserId: userId,
      action: 'plan_upgraded',
      resourceType: 'organization',
      resourceId: orgId,
      metadata: { plan, reference },
    })
  }

  if (event.event === 'subscription.disable' || event.event === 'subscription.not_renew') {
    const subCode = event.data.subscription_code
    if (subCode) {
      const { data: org } = await supabase.from('organizations')
        .update({ plan: 'free', paystack_subscription_code: null, updated_at: new Date().toISOString() })
        .eq('paystack_subscription_code', subCode)
        .select('id')
        .single()
      
      if (org) {
        const { revalidatePath } = await import('next/cache')
        revalidatePath('/dashboard', 'layout')
      }
    }
  }

  return NextResponse.json({ received: true })
}
