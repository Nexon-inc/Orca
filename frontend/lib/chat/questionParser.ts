export type ParsedInChatQuestion = {
  question: string
  options: string[]
  contentWithoutQuestion: string
}

const QUESTION_PATTERN =
  /\[QUESTION:\s*"([^"]+)"\s*options=\[([^\]]*)\]\]/i

export function parseInChatQuestion(text: string): ParsedInChatQuestion | null {
  const match = text.match(QUESTION_PATTERN)
  if (!match) return null

  const question = match[1].trim()
  const options = [...match[2].matchAll(/"([^"]+)"/g)].map((m) => m[1].trim()).filter(Boolean)
  if (!question || options.length === 0) return null

  const contentWithoutQuestion = text.replace(match[0], '').trim()
  return { question, options, contentWithoutQuestion }
}
