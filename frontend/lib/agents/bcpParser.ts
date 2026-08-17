export interface BcpUserPreferences {
  user_id: string;
  preferred_name?: string;
  communication_style?: 'direct' | 'collaborative' | 'executive';
  expertise_level?: 'technical' | 'business' | 'founder';
  notification_preferences?: {
    proactive_questions?: boolean;
    weekly_bcp_review?: boolean;
    conflict_alerts?: boolean;
  };
}

export interface BcpDepartment {
  name: string;
  lead: string;
  resources: string[];
  tools: string[];
}

export interface BcpWorkflowStep {
  step: number;
  department: string;
  action: string;
}

export interface BcpWorkflow {
  name: string;
  steps: BcpWorkflowStep[];
}

export interface BcpCustomerInsights {
  icp?: string;
  personas?: string[];
  pain_points?: string[];
  churn_reasons?: string[];
}

export interface BcpBusinessGoals {
  primary_goals?: string[];
  north_star_metric?: string;
  target_milestones?: string[];
}

export interface BcpConfig {
  version?: number;
  updated_at?: string;
  company_stage?: 'seed' | 'growth' | 'enterprise';
  completeness_score?: number; // 0 - 100
  domain?: string;
  metrics?: string;
  business_goals?: BcpBusinessGoals;
  customer_insights?: BcpCustomerInsights;
  tech_stack?: string[];
  user_corrected_fields?: Record<string, boolean>;
  user_preferences?: Record<string, BcpUserPreferences>;
  departments: Record<string, BcpDepartment>;
  workflows: Record<string, BcpWorkflow>;
}

/**
 * Returns field-level slice of BCP based on executive role scope.
 * Ghost (CTO) -> tech_stack
 * Rex (CSO) -> customer_insights & business_goals
 * Aria (CMO) -> customer_insights & brand positioning
 * Purity (CCO) -> customer_insights & churn
 */
export function getBcpSliceForExecutive(bcp: BcpConfig, roleAcronym: string): Partial<BcpConfig> {
  const role = roleAcronym.toUpperCase();
  if (role === 'CTO' || role === 'GHOST') {
    return {
      tech_stack: bcp.tech_stack || [],
      domain: bcp.domain,
      departments: bcp.departments?.['CTO'] ? { CTO: bcp.departments['CTO'] } : {}
    };
  }
  if (role === 'CSO' || role === 'REX') {
    return {
      customer_insights: bcp.customer_insights,
      business_goals: bcp.business_goals,
      company_stage: bcp.company_stage
    };
  }
  if (role === 'CMO' || role === 'ARIA') {
    return {
      customer_insights: bcp.customer_insights,
      business_goals: bcp.business_goals
    };
  }
  if (role === 'CCO' || role === 'PURITY') {
    return {
      customer_insights: bcp.customer_insights
    };
  }
  // CEO / Atlas gets full cross-product BCP slice
  return bcp;
}

/**
 * Parses a standard Markdown Business Protocol spec into a structured BCP configuration.
 */
export function parseBcpMarkdown(markdown: string): BcpConfig {
  const config: BcpConfig = {
    departments: {},
    workflows: {}
  };

  if (!markdown) return config;

  const lines = markdown.split(/\r?\n/);
  let currentSection: 'root' | 'org' | 'departments' | 'workflows' | null = null;
  let currentSubSection: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect root or headers
    if (line.startsWith('# ')) {
      currentSection = 'root';
      continue;
    }

    if (line.startsWith('## ')) {
      const secName = line.substring(3).trim().toLowerCase();
      if (secName.includes('organization') || secName.includes('detail')) {
        currentSection = 'org';
      } else if (secName.includes('department') || secName.includes('role') || secName.includes('executive')) {
        currentSection = 'departments';
      } else if (secName.includes('workflow') || secName.includes('sprint') || secName.includes('process')) {
        currentSection = 'workflows';
      } else {
        currentSection = null;
      }
      currentSubSection = null;
      continue;
    }

    // Detect subsections (e.g. ### CMO (Aria))
    if (line.startsWith('### ')) {
      currentSubSection = line.substring(4).trim();
      if (currentSection === 'departments') {
        const cleanName = currentSubSection.split('-')[0].trim();
        config.departments[cleanName] = {
          name: cleanName,
          lead: currentSubSection,
          resources: [],
          tools: []
        };
      } else if (currentSection === 'workflows') {
        config.workflows[currentSubSection] = {
          name: currentSubSection,
          steps: []
        };
      }
      continue;
    }

    // Parse items within sections
    if (currentSection === 'org') {
      const match = line.match(/^\*?\s*\*\*([^*]+)\*\*:\s*`?([^`\s]+)`?/i);
      if (match) {
        const key = match[1].trim().toLowerCase();
        const value = match[2].trim();
        if (key === 'domain') config.domain = value;
        if (key === 'metrics') config.metrics = value;
      }
    } else if (currentSection === 'departments' && currentSubSection) {
      const cleanName = currentSubSection.split('-')[0].trim();
      const dept = config.departments[cleanName];
      if (dept) {
        if (line.toLowerCase().includes('**resources:**')) {
          const parts = line.split(/\*\*resources:\*\*/i);
          const resList = parts[1] || '';
          dept.resources = resList.split(',').map(s => s.replace(/[`*]/g, '').trim()).filter(Boolean);
        } else if (line.toLowerCase().includes('**tools:**')) {
          const parts = line.split(/\*\*tools:\*\*/i);
          const toolList = parts[1] || '';
          dept.tools = toolList.split(',').map(s => s.replace(/[`*]/g, '').trim()).filter(Boolean);
        }
      }
    } else if (currentSection === 'workflows' && currentSubSection) {
      const workflow = config.workflows[currentSubSection];
      if (workflow) {
        // Parse step: "1. **Ops (CEO):** Coordinate..."
        const match = line.match(/^(\d+)\.\s*(?:\*\*([^*]+)\*\*:?)?\s*(.+)$/);
        if (match) {
          const stepNum = parseInt(match[1], 10);
          const deptOrAgent = match[2] ? match[2].trim().replace(/:$/, '') : '';
          const actionText = match[3].trim();
          workflow.steps.push({
            step: stepNum,
            department: deptOrAgent,
            action: actionText
          });
        }
      }
    }
  }

  return config;
}
