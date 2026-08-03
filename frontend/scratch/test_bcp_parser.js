const { parseBcpMarkdown } = require('../frontend/lib/agents/bcpParser');

const mockProtocol = `# Business Protocol: Acme Corp

## 1. Organization Details
* **Domain:** \`acme.co\`
* **Metrics:** \`business://analytics/live\`

## 2. Departments & Roles

### CEO (Atlas) - Operations
* **Resources:** \`business://wiki/strategy_blueprint\`, \`business://briefs/current\`

### CMO (Aria) - Marketing
* **Resources:** \`business://analytics/social_metrics\`
* **Tools:** \`social://twitter/post\`, \`social://linkedin/post\`

### CTO (Ghost) - Technology
* **Resources:** \`business://docs/architecture_spec\`
* **Tools:** \`dev://github/create_pr\`

## 3. Workflows

### Launch Sprint
1. **CEO:** Coordinate sprint goals and publish initial roadmap.
2. **CMO:** Post launch announcement tweet on Twitter/X.
3. **CTO:** Open a pull request integrating security controls.
`;

console.log('Parsing mock BCP Markdown...');
const config = parseBcpMarkdown(mockProtocol);
console.log('Resulting Config:\n', JSON.stringify(config, null, 2));
