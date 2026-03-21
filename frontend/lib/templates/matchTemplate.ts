export interface OnboardingStep1Data {
  industry: string;
  mission: string;
  icp: string;
  name?: string;
}

export function matchTemplate(data: OnboardingStep1Data): string | null {
  const { industry, mission } = data;
  const missionLower = mission.toLowerCase();
  const industryLower = (industry || "").toLowerCase();

  // SaaS Startup
  if (
    ['saas / software', 'saas', 'software', 'technology', 'internet'].includes(industryLower) &&
    (missionLower.includes('startup') || missionLower.includes('early') || missionLower.includes('product') || missionLower.includes('software'))
  ) {
    return 'saas-startup';
  }

  // Dev Agency — tech + mentions building/developing
  if (
    ['saas / software', 'software', 'technology', 'consulting / professional services'].includes(industryLower) &&
    (missionLower.includes('build') || missionLower.includes('develop') || missionLower.includes('agency') || missionLower.includes('client'))
  ) {
    return 'dev-agency';
  }

  // Recruiting Firm — mentions hiring/talent
  if (
    ['hiring & recruitment', 'hr', 'staffing'].includes(industryLower) ||
    missionLower.includes('hire') || missionLower.includes('talent') ||
    missionLower.includes('recruit') || missionLower.includes('staffing')
  ) {
    return 'recruiting-firm';
  }

  // E-commerce
  if (
    ['e-commerce', 'ecommerce', 'retail', 'consumer'].includes(industryLower) ||
    missionLower.includes('sell') || missionLower.includes('store') ||
    (missionLower.includes('product') && missionLower.includes('buy'))
  ) {
    return 'ecommerce-operator';
  }

  // Content Agency — marketing/agency focus
  if (
    ['marketing agency', 'media', 'media & entertainment', 'content'].includes(industryLower) ||
    missionLower.includes('content') || missionLower.includes('marketing agency') || missionLower.includes('marketing') || missionLower.includes('seo')
  ) {
    return 'content-marketing-agency';
  }

  // Intelligence/Research
  if (
    ['ai & machine learning', 'consulting / professional services'].includes(industryLower) ||
    missionLower.includes('research') || missionLower.includes('intelligence') ||
    missionLower.includes('analysis') || missionLower.includes('insights')
  ) {
    return 'intel-desk'; // spec says intelligence-research-desk, but the TEMPLATES array in page.tsx uses intel-desk
  }

  // No match — show all templates for manual selection
  return null;
}
