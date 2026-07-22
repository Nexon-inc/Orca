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

export interface BcpConfig {
  domain?: string;
  metrics?: string;
  departments: Record<string, BcpDepartment>;
  workflows: Record<string, BcpWorkflow>;
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
