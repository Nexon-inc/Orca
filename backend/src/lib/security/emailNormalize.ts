export function normalizeEmail(email: string): string {
  const [local, domain] = email.toLowerCase().split('@')

  // Gmail: strip plus tags and dots (user+tag@gmail.com → user@gmail.com)
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const normalized = local.split('+')[0].replace(/\./g, '')
    return `${normalized}@gmail.com`
  }

  // Outlook/Hotmail: strip plus tags
  if (['outlook.com', 'hotmail.com', 'live.com'].includes(domain)) {
    return `${local.split('+')[0]}@${domain}`
  }

  return email.toLowerCase()
}
