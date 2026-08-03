/**
 * ORCA pricing: customers see USD on the website.
 * Paystack checkout charges KES (your account currency).
 * Keep Paystack plan amounts aligned with `checkoutKes` below.
 */

export const DISPLAY_CURRENCY = 'USD' as const
export const CHECKOUT_CURRENCY = 'KES' as const

/** Annual checkout works when Paystack annual PLN_ codes + PAYSTACK_ANNUAL_ENABLED=true */
export const ANNUAL_CHECKOUT_ENABLED =
  process.env.PAYSTACK_ANNUAL_ENABLED === 'true' ||
  process.env.NEXT_PUBLIC_PRICING_ANNUAL_CHECKOUT === 'true'

export type OrcaPlanId = 'free' | 'pro'

export type OrcaPlanPricing = {
  id: OrcaPlanId
  name: string
  tagline: string
  /** Shown on pricing cards */
  monthlyUsd: number
  annualMonthlyUsd: number
  annualTotalUsd: number
  annualSavingsUsd: number
  /** Charged at Paystack (KES) — must match Paystack plan amounts */
  checkoutKesMonthly: number
  checkoutKesAnnualTotal: number
  features: string[]
  cta: string
  highlighted?: boolean
}

export const ORCA_PLANS: OrcaPlanPricing[] = [
  {
    id: 'free',
    name: 'FREE',
    tagline: 'Permanent access to core automation.',
    monthlyUsd: 0,
    annualMonthlyUsd: 0,
    annualTotalUsd: 0,
    annualSavingsUsd: 0,
    checkoutKesMonthly: 0,
    checkoutKesAnnualTotal: 0,
    features: [
      '2 active executive agents',
      '20 autonomous tasks per month',
      '1 team workspace slot',
      'Core business integrations',
      'Standard OrcaHub OS templates',
      'Basic departmental monitoring',
      'Community forum support',
    ],
    cta: 'Get Started Free',
  },
  {
    id: 'pro',
    name: 'PRO',
    tagline: 'Full C-Suite autonomy for founders ready to scale.',
    monthlyUsd: 99,
    annualMonthlyUsd: 79,
    annualTotalUsd: 948,
    annualSavingsUsd: 240,
    checkoutKesMonthly: 12999,
    checkoutKesAnnualTotal: 104990,
    features: [
      'All 6 C-Suite executives + AI CEO Mode (Atlas)',
      'Unlimited autonomous tasks',
      '5 team seats with department assigning',
      'All integrations + webhook alerts',
      'Code generation & Ghost CTO mode',
      'Out-of-Office Autopilot (3-day sprints)',
      'Unlimited Briefing Room archive',
      'Lunar AI Business Context agent',
      'Email support (24hr response SLA)',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
]

export function formatUsd(amount: number): string {
  if (amount === 0) return 'Free'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatKes(amount: number): string {
  if (amount === 0) return ''
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getDisplayUsd(
  plan: OrcaPlanPricing,
  billingCycle: 'monthly' | 'annual'
): number {
  if (plan.monthlyUsd === 0) return 0
  if (billingCycle === 'annual') return plan.annualMonthlyUsd
  return plan.monthlyUsd
}

export function getCheckoutKesHint(
  plan: OrcaPlanPricing,
  billingCycle: 'monthly' | 'annual'
): string {
  if (plan.checkoutKesMonthly === 0) return ''
  const kes =
    billingCycle === 'annual' && plan.checkoutKesAnnualTotal > 0
      ? plan.checkoutKesAnnualTotal
      : plan.checkoutKesMonthly
  const suffix =
    billingCycle === 'annual' && plan.checkoutKesAnnualTotal > 0 ? '/yr at checkout' : '/mo at checkout'
  return `${formatKes(kes)}${suffix}`
}

export function getCheckoutBillingCycle(
  requested?: string
): 'monthly' | 'annual' {
  if (requested === 'annual' && ANNUAL_CHECKOUT_ENABLED) return 'annual'
  return 'monthly'
}

/** Reference for Paystack dashboard — KES amounts only */
export const PAYSTACK_KES_REFERENCE = {
  pro_monthly: 12999,
  pro_annual: 104990,
} as const

/** Reference for marketing — USD amounts on site */
export const DISPLAY_USD_REFERENCE = {
  pro_monthly: 99,
  pro_annual_total: 948,
} as const
