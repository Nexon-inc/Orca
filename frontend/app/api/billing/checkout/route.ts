'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import { emailTemplates, resend } from '@/lib/email/resend'
import { writeAuditLog } from '@/lib/security/auditLog'
import { NextResponse } from 'next/server'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!

const PLAN_CODE_MAP: Record<string, Record<string, string>> = {
  builder: {
    monthly: process.env.PAYSTACK_PLAN_BUILDER_MONTHLY || process.env.PAYSTACK_PLAN_STARTER_MONTHLY!,
    annual: process.env.PAYSTACK_PLAN_BUILDER_ANNUAL || process.env.PAYSTACK_PLAN_STARTER_ANNUAL!,
  },
  pro: {
    monthly: process.env.PAYSTACK_PLAN_PRO_MONTHLY!,
    annual: process.env.PAYSTACK_PLAN_PRO_ANNUAL!,
  },
  founding: {
    monthly: process.env.PAYSTACK_PLAN_FOUNDING_MONTHLY || process.env.PAYSTACK_PLAN_BUILDER_MONTHLY || process.env.PAYSTACK_PLAN_STARTER_MONTHLY!,
    annual: process.env.PAYSTACK_PLAN_FOUNDING_ANNUAL || process.env.PAYSTACK_PLAN_BUILDER_ANNUAL || process.env.PAYSTACK_PLAN_STARTER_ANNUAL!,
  },
  // Legacy Paystack plan codes & org records
  starter: {
    monthly: process.env.PAYSTACK_PLAN_STARTER_MONTHLY!,
    annual: process.env.PAYSTACK_PLAN_STARTER_ANNUAL!,
  },
  enterprise: {
    monthly: process.env.PAYSTACK_PLAN_ENTERPRISE_MONTHLY!,
    annual: process.env.PAYSTACK_PLAN_ENTERPRISE_ANNUAL!,
  },
}

function normalizePlanId(raw?: string): string | null {
  if (!raw) return null
  const plan = raw.toLowerCase()
  if (plan === 'starter' || plan === 'growth') return 'builder'
  return plan
}

function isPlanCodeConfigured(code?: string): boolean {
  return Boolean(code && code.trim().length > 0)
}

function resolveBillingCycle(
  plan: string,
  requested?: string
): 'monthly' | 'annual' {
  const annualCode = PLAN_CODE_MAP[plan]?.annual
  const annualReady =
    process.env.PAYSTACK_ANNUAL_ENABLED === 'true' && isPlanCodeConfigured(annualCode)
  if (requested === 'annual' && annualReady) return 'annual'
  return 'monthly'
}

export async function POST(request: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan: rawPlan, billing_cycle: requestedCycle } = await request.json()
  const plan = normalizePlanId(rawPlan)
  if (!plan) {
    return NextResponse.json({ error: 'Plan is required.' }, { status: 400 })
  }
  const billing_cycle = resolveBillingCycle(plan, requestedCycle)
  const supabase = await createServerSupabaseClient()

  const { data: member } = await supabase
    .from('org_members')
    .select('org_id, role, profiles(email, full_name), organizations(name)')
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'cofounder'].includes(member.role)) {
    return NextResponse.json({ error: 'Only owners can upgrade the plan.' }, { status: 403 })
  }

  // Master admin bypass — this account has permanent enterprise access
  const userEmail = (member as any).profiles?.email || user.email
  if (userEmail?.toLowerCase().trim() === 'nexonicindustries@gmail.com') {
    return NextResponse.json(
      { error: 'Your account already has permanent Enterprise access. No payment required.' },
      { status: 200 }
    )
  }

  const orgId = (member as any).org_id
  const { data: org } = await supabase.from('organizations').select('checkout_locked_at, checkout_locked_by').eq('id', orgId).single()

  if (org?.checkout_locked_at) {
    const lockedAt = new Date(org.checkout_locked_at)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    if (lockedAt > fiveMinutesAgo) {
      return NextResponse.json({ error: 'A checkout is already in progress.' }, { status: 409 })
    }
  }

  await supabase.from('organizations').update({
    checkout_locked_at: new Date().toISOString(),
    checkout_locked_by: user.id,
  }).eq('id', orgId)

  const planCode = PLAN_CODE_MAP[plan]?.[billing_cycle]
  if (!planCode || planCode.includes('undefined')) {
    await supabase.from('organizations').update({ checkout_locked_at: null, checkout_locked_by: null }).eq('id', orgId)
    const hint =
      billing_cycle === 'annual'
        ? 'Annual billing is not configured yet. Use monthly or add PAYSTACK_PLAN_*_ANNUAL in Vercel.'
        : `Missing Paystack plan code for "${plan}" monthly. Add PAYSTACK_PLAN_${plan.toUpperCase()}_MONTHLY in Vercel.`
    return NextResponse.json({ error: hint }, { status: 400 })
  }

  const email = (member as any).profiles?.email || user.email!

  const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      plan: planCode,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/billing/verify`,
      metadata: {
        org_id: orgId,
        plan: plan === 'founding' ? 'builder' : plan,
        billing_cycle,
        user_id: user.id,
        founding: plan === 'founding',
      },
    }),
  })

  const paystackData = await paystackRes.json()

  if (!paystackData.status) {
    await supabase.from('organizations').update({ checkout_locked_at: null, checkout_locked_by: null }).eq('id', orgId)
    return NextResponse.json({ error: paystackData.message }, { status: 400 })
  }

  return NextResponse.json({
    authorization_url: paystackData.data.authorization_url,
    reference: paystackData.data.reference,
  })
}
