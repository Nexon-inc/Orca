const INPUT_LIMITS = {
  free:       500,   // characters (~125 tokens)
  starter:    3000,  // characters (~750 tokens)
  pro:        8000,  // characters (~2000 tokens)
  enterprise: 20000, // characters (~5000 tokens)
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
