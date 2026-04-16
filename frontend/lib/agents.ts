export interface Agent {
  id: string;
  name: string;
  icon: string;
  role: string;
  dept: string;
  description: string;
  prompts: string[];
}

/**
 * ORCA CORE EXECUTIVE ROSTER
 * Strictly consolidated to 6 leaders representing each core department.
 */
export const AGENT_ROSTER: Agent[] = [
  { 
    id: 'atlas', 
    name: 'Atlas', 
    icon: '🗺️', 
    role: 'CEO & Project Manager', 
    dept: 'ops', 
    description: 'The central orchestrator of the Autonomous OS. Manages project timelines, executes cross-department coordination, and handles user onboarding and business initialization.', 
    prompts: ['Initialise Project', 'Weekly Ops Report', 'Sync Departments'] 
  },
  { 
    id: 'aria', 
    name: 'Aria', 
    icon: '🎙️', 
    role: 'Chief Marketing Officer', 
    dept: 'marketing', 
    description: 'Leads the brand voice and marketing engine. Handles social media strategy, content writing, and brand amplification.', 
    prompts: ['Draft Social Strategy', 'Create Content Calendar', 'Brand Audit'] 
  },
  { 
    id: 'rex', 
    name: 'Rex', 
    icon: '💰', 
    role: 'Chief Sales Officer', 
    dept: 'sales', 
    description: 'The revenue engine. Manages lead prospecting, CRM cleanup, and outreach sequencing.', 
    prompts: ['Find New Leads', 'Clean CRM Data', 'Outreach Sequence'] 
  },
  { 
    id: 'purity', 
    name: 'Purity', 
    icon: '🛟', 
    role: 'Chief Customer Officer', 
    dept: 'cs', 
    description: 'Guardian of the customer experience. Handles support coordination, onboarding journeys, and retention analysis.', 
    prompts: ['Retention Report', 'Onboarding Flow', 'Support Summary'] 
  },
  { 
    id: 'roman', 
    name: 'Roman', 
    icon: '🏛️', 
    role: 'Chief Intelligence Officer', 
    dept: 'intel', 
    description: 'The brain of the system. Performs deep market research, competitive analysis, and real-time trend monitoring.', 
    prompts: ['Competitor Intel', 'Market Research', 'Trend Scan'] 
  },
  { 
    id: 'ghost', 
    name: 'Ghost', 
    icon: '👻', 
    role: 'Chief Technology Officer', 
    dept: 'tech', 
    description: 'The security and infrastructure anchor. Manages code security, vulnerability scanning, and infrastructure reliability.', 
    prompts: ['Security Scan', 'System Audit', 'Infra Stress Test'] 
  }
];

export const getAgentsByDept = (dept: string) => AGENT_ROSTER.filter(a => a.dept === dept);
export const getAgentById = (id: string) => AGENT_ROSTER.find(a => a.id === id);
export const getExecutiveAgents = () => AGENT_ROSTER;
