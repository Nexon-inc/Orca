const HARMFUL_OUTPUT_PATTERNS = [
  /how\s+to\s+(make|create|build)\s+(a\s+)?(bomb|weapon|virus|malware)/i,
  /step[s\-]by[s\-]step.*(hack|exploit|attack)/i,
  /suicide\s+(method|instruction|how\s+to)/i,
  /self.harm\s+(instruction|method)/i,
]

const ROLEPLAY_INJECTION_PATTERNS = [
  /pretend\s+(you\s+are|to\s+be)\s+(an?\s+)?(AI\s+with\s+no|unrestricted|jailbroken)/i,
  /act\s+as\s+(if\s+you\s+have\s+no|without)\s+(restrictions|limits|rules)/i,
  /in\s+this\s+(story|roleplay|scenario|fiction).*(explain|describe|show)\s+how/i,
  /write\s+a\s+(story|scene|roleplay)\s+where.*(character|person)\s+(explains|teaches)/i,
]

export function filterOutput(output: string): {
  safe: boolean
  filtered?: string
  reason?: string
} {
  for (const pattern of HARMFUL_OUTPUT_PATTERNS) {
    if (pattern.test(output)) {
      return { safe: false, reason: 'harmful_content_detected' }
    }
  }
  return { safe: true }
}

export function detectRoleplayInjection(input: string): boolean {
  return ROLEPLAY_INJECTION_PATTERNS.some(p => p.test(input))
}

export function filterAgentOutput(output: string): string {
  const { safe, reason } = filterOutput(output)
  if (!safe) {
    if (reason === 'harmful_content_detected') {
      return '[REDACTED: Potential safety violation detected by ORCA CyberGuard]'
    }
    return '[FILTERED]'
  }
  return output
}
