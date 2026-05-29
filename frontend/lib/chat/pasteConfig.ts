/** Pastes longer than this use document-attachment mode (not the chat input). */
export const LONG_PASTE_CHAR_THRESHOLD = 15000

export const DIRECTIVE_RUN_INSTRUCTION =
  'Execute the attached directive in full. You have Automate authority — do not ask clarifying questions. Begin immediately with Phase 1.'

export function isDirectivePaste(text: string): boolean {
  return /BEGIN NOW|DIRECTIVE_DOCUMENT|ORCA EMERGENCY|FULL AUTOMATE authority|REVENUE SPRINT/i.test(
    text
  )
}
