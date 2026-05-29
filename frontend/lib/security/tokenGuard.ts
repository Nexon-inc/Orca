const INPUT_LIMITS = {
  free:       500,
  builder:    2000,
  starter:    2000,  // legacy alias
  pro:        8000,
  enterprise: 20000,
}

export function enforceInputLimit(
  content: string,
  plan: string
): { allowed: boolean; truncated?: string; error?: string } {
  const limit = INPUT_LIMITS[plan as keyof typeof INPUT_LIMITS] ?? 500

  if (content.length <= limit) return { allowed: true }

  return {
    allowed: false,
    error: `Your brief exceeds the ${plan} plan limit of ${limit} characters. Upgrade for longer briefs, or shorten your message.`,
  }
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4) // ~4 chars per token
}

export async function checkTokenGuard(orgId: string, contentLen: number): Promise<{ allowed: boolean; reason?: string }> {
  // In a real app, you'd check the org's plan in Supabase
  // For now, we'll use a conservative default or mock the check
  const plan = 'pro' // Defaulting to pro for now to avoid blocking users
  const { allowed, error } = enforceInputLimit(' '.repeat(contentLen), plan)
  return { allowed, reason: error }
}
