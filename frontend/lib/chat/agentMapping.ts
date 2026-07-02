export const AGENT_MAPPING: Record<string, { name: string; department_key: string; icon: string; title: string }> = {
  CEO: { name: 'Atlas', department_key: 'ceo', icon: '🏦', title: 'Atlas (CEO/Ops)' },
  CMO: { name: 'Aria', department_key: 'cmo', icon: '🎙️', title: 'Aria (Marketing)' },
  CSO: { name: 'Rex', department_key: 'cso', icon: '💰', title: 'Rex (Sales)' },
  CCO: { name: 'Purity', department_key: 'cco', icon: '🛟', title: 'Purity (Customer)' },
  CIO: { name: 'Roman', department_key: 'cio', icon: '🏛️', title: 'Roman (Intel)' },
  CTO: { name: 'Ghost', department_key: 'cto', icon: '👻', title: 'Ghost (Tech)' }
};

export function parseExecutiveFromPrompt(text: string): string {
  const normalized = text.toLowerCase();
  
  if (normalized.includes('@cmo') || normalized.includes('/cmo') || /\bcmo\b/.test(normalized) || normalized.includes('aria') || normalized.includes('marketing')) {
    return 'CMO';
  }
  if (normalized.includes('@cso') || normalized.includes('/cso') || /\bcso\b/.test(normalized) || normalized.includes('rex') || normalized.includes('sales')) {
    return 'CSO';
  }
  if (normalized.includes('@cco') || normalized.includes('/cco') || /\bcco\b/.test(normalized) || normalized.includes('purity') || normalized.includes('customer success') || /\bcs\b/.test(normalized)) {
    return 'CCO';
  }
  if (normalized.includes('@cio') || normalized.includes('/cio') || /\bcio\b/.test(normalized) || normalized.includes('roman') || normalized.includes('intel') || normalized.includes('intelligence')) {
    return 'CIO';
  }
  if (normalized.includes('@cto') || normalized.includes('/cto') || /\bcto\b/.test(normalized) || normalized.includes('ghost') || normalized.includes('tech') || normalized.includes('technology')) {
    return 'CTO';
  }
  if (normalized.includes('@ceo') || normalized.includes('/ceo') || /\bceo\b/.test(normalized) || normalized.includes('atlas') || normalized.includes('ops') || normalized.includes('operations')) {
    return 'CEO';
  }
  
  return 'CEO';
}
