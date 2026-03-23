const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now\s+(DAN|GPT|a\s+different|an\s+AI)/i,
  /forget\s+(everything|your\s+instructions|your\s+role)/i,
  /act\s+as\s+(if\s+you\s+(are|were)|a\s+different)/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /###\s*instruction/i,
  /output\s+(all|every|other\s+users?|conversation\s+history)/i,
  /reveal\s+(your\s+)?(system\s+prompt|instructions|context)/i,
  /print\s+(your\s+)?(system\s+prompt|full\s+context)/i,
]

export function detectPromptInjection(input: string): {
  clean: boolean
  flagged: boolean
  reason?: string
} {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        clean: false,
        flagged: true,
        reason: `Potential prompt injection detected: ${pattern.toString()}`
      }
    }
  }
  return { clean: true, flagged: false }
}

export function sanitizeInput(input: string): string {
  // Strip HTML tags
  let clean = input.replace(/<[^>]*>/g, '')
  // Strip null bytes
  clean = clean.replace(/\0/g, '')
  // Limit length to 2000 characters
  clean = clean.slice(0, 2000)
  // Strip obvious injection starters
  clean = clean.replace(/^(system|assistant|user)\s*:/gi, '')
  return clean.trim()
}
