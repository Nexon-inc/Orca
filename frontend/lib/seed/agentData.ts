// Single source of truth for all 6 core executives — used by the seed function
export const AGENT_SEED_DATA = [
  { dept: 'ops',       name: 'Atlas',  icon: '⬡', acronym: 'AT', role: 'AI CEO',                    csuite_title: 'Chief Executive Officer', is_department_head: true },
  { dept: 'marketing', name: 'Aria',   icon: '🎙️', acronym: 'AR', role: 'Chief Marketing Officer',   csuite_title: 'Chief Marketing Officer', is_department_head: true },
  { dept: 'sales',     name: 'Rex',    icon: '💰', acronym: 'RX', role: 'Chief Sales Officer',       csuite_title: 'Chief Sales Officer',     is_department_head: true },
  { dept: 'cs',        name: 'Purity', icon: '🛟', acronym: 'PU', role: 'Chief Customer Officer',    csuite_title: 'Chief Customer Officer',  is_department_head: true },
  { dept: 'intel',     name: 'Roman',  icon: '🏛️', acronym: 'RM', role: 'Chief Intelligence Officer', csuite_title: 'Chief Intelligence Officer', is_department_head: true },
  { dept: 'tech',      name: 'Ghost',  icon: '👻', acronym: 'GH', role: 'Chief Technology Officer',   csuite_title: 'Chief Technology Officer',   is_department_head: true },
]

export const ACTIVE_DEPT_KEYS = ['marketing', 'sales', 'cs', 'intel', 'tech']

export const DEPARTMENT_SEED_DATA = [
  { key: 'marketing', name: 'Marketing',            icon: '📣' },
  { key: 'sales',     name: 'Sales & Revenue',      icon: '💼' },
  { key: 'cs',        name: 'Customer Success',     icon: '🤝' },
  { key: 'tech',      name: 'Tech & Code generation',   icon: '🛡️' },
  { key: 'intel',     name: 'Intelligence & Research', icon: '🔍' },
]
