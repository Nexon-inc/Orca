// Single source of truth for all 45 agents — used by the seed function

export const AGENT_SEED_DATA = [
  // ── MARKETING ──────────────────────────────────────────────
  { dept: 'marketing', name: 'Aria',   icon: '🎙️', acronym: 'AR', role: 'Social Media Manager' },
  { dept: 'marketing', name: 'Jackie', icon: '✍️', acronym: 'JK', role: 'Content Writer' },
  { dept: 'marketing', name: 'Eric',   icon: '📢', acronym: 'ER', role: 'Ads Manager' },
  { dept: 'marketing', name: 'Lucy',   icon: '🔍', acronym: 'LC', role: 'SEO Specialist' },
  { dept: 'marketing', name: 'Joe',    icon: '🎨', acronym: 'JO', role: 'Brand Voice' },

  // ── SALES & REVENUE ────────────────────────────────────────
  { dept: 'sales', name: 'Rex',   icon: '💰', acronym: 'RX', role: 'Lead Prospector' },
  { dept: 'sales', name: 'Clara', icon: '📋', acronym: 'CL', role: 'CRM Manager' },
  { dept: 'sales', name: 'Chase', icon: '🏃', acronym: 'CH', role: 'Follow-up Agent' },
  { dept: 'sales', name: 'Mark',  icon: '📬', acronym: 'MK', role: 'Outreach Agent' },
  { dept: 'sales', name: 'Teo',   icon: '🔭', acronym: 'TE', role: 'Sales Intel' },

  // ── CUSTOMER SUCCESS ───────────────────────────────────────
  { dept: 'cs', name: 'Purity',   icon: '🛟', acronym: 'PU', role: 'Support Agent' },
  { dept: 'cs', name: 'Bruce',    icon: '🧭', acronym: 'BR', role: 'Onboarding Agent' },
  { dept: 'cs', name: 'Nadia',    icon: '🔗', acronym: 'ND', role: 'Retention Agent' },
  { dept: 'cs', name: 'John',     icon: '📊', acronym: 'JN', role: 'NPS Agent' },
  { dept: 'cs', name: 'Beatrice', icon: '💚', acronym: 'BE', role: 'Customer Health' },

  // ── TECH & SECURITY ────────────────────────────────────────
  { dept: 'tech', name: 'Ghost',  icon: '👻', acronym: 'GH', role: 'Security Scanner (CyberGuard)' },
  { dept: 'tech', name: 'Cipher', icon: '🔐', acronym: 'CP', role: 'Code Reviewer' },
  { dept: 'tech', name: 'Wren',   icon: '⚙️', acronym: 'WR', role: 'DevOps Agent' },
  { dept: 'tech', name: 'Hex',    icon: '📖', acronym: 'HX', role: 'Docs Agent' },
  { dept: 'tech', name: 'Volt',   icon: '⚡', acronym: 'VT', role: 'Incident Response' },

  // ── PEOPLE & HIRING ────────────────────────────────────────
  { dept: 'hiring', name: 'Marcus', icon: '🔎', acronym: 'MC', role: 'Talent Sourcer' },
  { dept: 'hiring', name: 'Vera',   icon: '🧬', acronym: 'VR', role: 'Candidate Screener' },
  { dept: 'hiring', name: 'Zara',   icon: '✅', acronym: 'ZR', role: 'Verification Agent' },
  { dept: 'hiring', name: 'Eli',    icon: '📝', acronym: 'EL', role: 'Offer Coordinator' },
  { dept: 'hiring', name: 'Nina',   icon: '🌱', acronym: 'NI', role: 'Culture & Onboarding' },

  // ── OPERATIONS ─────────────────────────────────────────────
  { dept: 'ops', name: 'Atlas', icon: '🗺️', acronym: 'AT', role: 'Project Manager' },
  { dept: 'ops', name: 'Cal',   icon: '📅', acronym: 'CA', role: 'Calendar Agent' },
  { dept: 'ops', name: 'Dean',  icon: '🗒️', acronym: 'DN', role: 'Notes & Docs Agent' },
  { dept: 'ops', name: 'Iris',  icon: '📥', acronym: 'IR', role: 'Inbox Agent' },
  { dept: 'ops', name: 'Owen',  icon: '🔄', acronym: 'OW', role: 'Task Coordinator' },

  // ── FINANCE & LEGAL ────────────────────────────────────────
  { dept: 'finance', name: 'Bill',   icon: '🧾', acronym: 'BL', role: 'Invoicing Agent' },
  { dept: 'finance', name: 'Felix',  icon: '💳', acronym: 'FX', role: 'Expense Tracker' },
  { dept: 'finance', name: 'Lena',   icon: '⚖️', acronym: 'LN', role: 'Contract Agent' },
  { dept: 'finance', name: 'Reid',   icon: '📐', acronym: 'RD', role: 'Budget Agent' },
  { dept: 'finance', name: 'Cora',   icon: '🔬', acronym: 'CO', role: 'Financial Review' },

  // ── INTELLIGENCE & RESEARCH ────────────────────────────────
  { dept: 'intel', name: 'Roman',    icon: '🏛️', acronym: 'RM', role: 'Research Agent' },
  { dept: 'intel', name: 'Sage',     icon: '📡', acronym: 'SG', role: 'Market Listener' },
  { dept: 'intel', name: 'Nate',     icon: '📰', acronym: 'NT', role: 'Summary Agent' },
  { dept: 'intel', name: 'Ada',      icon: '🔮', acronym: 'AD', role: 'Forecasting Agent' },
  { dept: 'intel', name: 'Dex',      icon: '📈', acronym: 'DX', role: 'Trend Analyst' },

  // ── COMMUNITY & GROWTH ─────────────────────────────────────
  { dept: 'community', name: 'Spike', icon: '🚀', acronym: 'SP', role: 'Growth Agent' },
  { dept: 'community', name: 'Milo',  icon: '🎵', acronym: 'ML', role: 'Community Manager' },
  { dept: 'community', name: 'Rio',   icon: '🤝', acronym: 'RI', role: 'Partnership Agent' },
  { dept: 'community', name: 'Zoe',   icon: '🌟', acronym: 'ZO', role: 'Influencer Agent' },
  { dept: 'community', name: 'Kai',   icon: '🔊', acronym: 'KI', role: 'Brand Amplifier' },
]

export const DEPARTMENT_SEED_DATA = [
  { key: 'marketing', name: 'Marketing',            icon: '📣' },
  { key: 'sales',     name: 'Sales & Revenue',      icon: '💼' },
  { key: 'cs',        name: 'Customer Success',     icon: '🤝' },
  { key: 'tech',      name: 'Tech & Security',      icon: '🛡️' },
  { key: 'hiring',    name: 'People & Hiring',      icon: '🧠' },
  { key: 'ops',       name: 'Operations',           icon: '📋' },
  { key: 'finance',   name: 'Finance & Legal',      icon: '📊' },
  { key: 'intel',     name: 'Intelligence & Research', icon: '🔍' },
  { key: 'community', name: 'Community & Growth',   icon: '🌐' },
]
