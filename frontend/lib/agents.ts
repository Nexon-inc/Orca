export interface Agent {
  id: string;
  name: string;
  icon: string;
  role: string;
  dept: string;
  description: string;
  prompts: string[];
}

export const AGENT_ROSTER: Agent[] = [
  // MARKETING
  { id: 'aria', name: 'Aria', icon: '🎙️', role: 'Social Media Manager', dept: 'marketing', description: 'Plans, writes, and schedules social content. Can generate videos using [GENERATE_VIDEO: template=SocialTemplate, text=X].', prompts: ['Write 5 tweets', 'Draft LinkedIn post', 'Content calendar', 'Schedule posts', 'Analyse engagement'] },
  { id: 'jackie', name: 'Jackie', icon: '✍️', role: 'Content Writer', dept: 'marketing', description: 'Long-form blogs, email sequences, landing page copy. Can generate summary videos using [GENERATE_VIDEO: template=BlogSummary, title=X, points=["a","b"]].', prompts: ['Write blog post', 'Email sequence', 'Landing copy', 'Newsletter draft', 'Product description'] },
  { id: 'eric', name: 'Eric', icon: '📢', role: 'Ads Manager', dept: 'marketing', description: 'Writes ad copy, manages campaigns. Can generate videos using [GENERATE_VIDEO: template=AdTemplate, headline=X, subheadline=Y, cta=Z].', prompts: ['Ad copy', 'Performance analysis', 'A/B test ideas', 'Budget allocation', 'Targeting audit'] },
  { id: 'lucy', name: 'Lucy', icon: '🔍', role: 'SEO Specialist', dept: 'marketing', description: 'Keyword research, meta descriptions, rank tracking, technical SEO audits, link building briefs.', prompts: ['SEO audit', 'Keyword research', 'Meta descriptions', 'Rank tracking', 'Link audit'] },
  { id: 'joe', name: 'Joe', icon: '🎨', role: 'Brand Voice', dept: 'marketing', description: 'Maintains brand guidelines, reviews all content for tone consistency, updates style guide, audits voice across channels.', prompts: ['Brand review', 'Update guidelines', 'Tone analysis', 'Voice audit', 'Style guide'] },

  // SALES
  { id: 'rex', name: 'Rex', icon: '💰', role: 'Lead Prospector', dept: 'sales', description: 'Finds high-intent leads using hiring signals, funding data, and social activity. Builds qualified prospect lists.', prompts: ['Find 10 leads', 'LinkedIn search', 'ICP match', 'Prospect list', 'Hiring signals'] },
  { id: 'clara', name: 'Clara', icon: '📋', role: 'CRM Manager', dept: 'sales', description: 'Keeps the CRM clean and updated. Logs meetings, moves deals through stages, flags overdue opportunities.', prompts: ['Update CRM', 'Log meeting', 'Pipeline summary', 'Deal health check', 'Flag overdue'] },
  { id: 'chase', name: 'Chase', icon: '🏃', role: 'Follow-up Agent', dept: 'sales', description: 'Sends timed follow-up sequences, re-engages cold leads, writes breakup emails, monitors reply rates.', prompts: ['Send follow-up', 'Re-engage cold', 'Breakup email', 'Open rate check', 'Sequence audit'] },
  { id: 'mark_sales', name: 'Mark', icon: '📬', role: 'Outreach Agent', dept: 'sales', description: 'Writes personalised cold emails, subject lines, LinkedIn messages, and multi-step sequences.', prompts: ['Write outreach', 'Subject lines', 'Cold email rewrite', 'Personalise messages', 'LinkedIn DM'] },
  { id: 'teo', name: 'Teo', icon: '🔭', role: 'Sales Intel', dept: 'sales', description: 'Researches target accounts, maps buyer personas, delivers competitive intel, validates ICP fit.', prompts: ['Research account', 'Competitive intel', 'Buyer persona', 'Market sizing', 'ICP validation'] },

  // CUSTOMER SUCCESS
  { id: 'purity', name: 'Purity', icon: '🛟', role: 'Support Agent', dept: 'customer', description: 'Handles incoming support tickets, drafts replies, updates FAQ, escalates critical issues, summarises support trends.', prompts: ['Resolve ticket', 'Draft reply', 'FAQ update', 'Support summary', 'Escalate issue'] },
  { id: 'bruce', name: 'Bruce', icon: '🧭', role: 'Onboarding Agent', dept: 'customer', description: 'Sends welcome sequences, walks new customers through setup, checks in at key milestones, builds onboarding guides.', prompts: ['Welcome email', 'Onboarding checklist', 'Feature walkthrough', 'Check-in message', 'Setup guide'] },
  { id: 'nadia', name: 'Nadia', icon: '🔗', role: 'Retention Agent', dept: 'customer', description: 'Identifies churn-risk accounts, drafts retention emails, analyses usage patterns, runs win-back campaigns.', prompts: ['Churn risks', 'Retention email', 'Usage analysis', 'Win-back campaign', 'Health report'] },
  { id: 'john_cs', name: 'John', icon: '📊', role: 'NPS Agent', dept: 'customer', description: 'Sends NPS surveys, analyses responses, segments detractors/promoters, builds feedback reports.', prompts: ['Send NPS survey', 'Analyse responses', 'Customer summary', 'Feedback report', 'Review patterns'] },
  { id: 'beatrice', name: 'Beatrice', icon: '💚', role: 'Customer Health', dept: 'customer', description: 'Tracks account health scores, flags at-risk customers before they churn, coordinates with Nadia on interventions.', prompts: ['Account health', 'Flag at-risk', 'Health score update', 'Risk summary', 'Intervention brief'] },

  // TECH & SECURITY
  { id: 'ghost', name: 'Ghost', icon: '👻', role: 'Security Scanner', dept: 'tech', description: 'Powered by CyberGuard. Scans repos for vulnerabilities, reviews auth flows, opens fix PRs automatically.', prompts: ['Scan codebase', 'Check dependencies', 'Security report', 'Review auth flow', 'Fix vulnerability'] },
  { id: 'cipher', name: 'Cipher', icon: '🔐', role: 'Code Reviewer', dept: 'tech', description: 'Reviews PRs for quality, flags tech debt, suggests refactors, architecture reviews, security pattern checks.', prompts: ['Review PR', 'Code quality', 'Flag tech debt', 'Suggest refactors', 'Architecture review'] },
  { id: 'wren', name: 'Wren', icon: '⚙️', role: 'DevOps & Code Generation', dept: 'tech', description: 'Writes production-ready code, generates fixes, scaffolds features, manages deployments and CI/CD.', prompts: ['Generate component', 'Write API route', 'Fix this code', 'Scaffold feature', 'Write tests', 'Deploy to staging'] },
  { id: 'hex', name: 'Hex', icon: '📖', role: 'Docs Agent', dept: 'tech', description: 'Writes and updates API docs, changelogs, README files, code comments, internal wikis.', prompts: ['Update docs', 'API reference', 'Write changelog', 'Code comments', 'README update'] },
  { id: 'volt', name: 'Volt', icon: '⚡', role: 'Incident Response', dept: 'tech', description: 'Monitors uptime, responds to alerts, coordinates incident timelines, writes post-mortems, escalates critical issues.', prompts: ['Incident report', 'Monitor uptime', 'Alert triage', 'Post-mortem', 'Escalate critical'] },

  // PEOPLE
  { id: 'marcus', name: 'Marcus', icon: '🔎', role: 'Talent Sourcer', dept: 'people', description: 'Sources candidates from The Summit, LinkedIn, and talent networks. Builds pipelines for open roles.', prompts: ['Source candidates', 'LinkedIn search', 'Talent pipeline', 'Referrals', 'ICP match'] },
  { id: 'vera', name: 'Vera', icon: '🧬', role: 'Candidate Screener', dept: 'people', description: 'Screens applicants, scores applications, writes interview questions, assesses culture fit and skills.', prompts: ['Screen candidates', 'Score applications', 'Interview questions', 'Culture fit', 'Skills assessment'] },
  { id: 'zara', name: 'Zara', icon: '✅', role: 'Verification Agent', dept: 'people', description: 'Powered by Intuition. Runs background checks, reference verification, employment history, and behavioral scoring.', prompts: ['Verify background', 'Reference check', 'Portfolio review', 'Employment check', 'Behavioral score'] },
  { id: 'eli', name: 'Eli', icon: '📝', role: 'Offer Coordinator', dept: 'people', description: 'Drafts offer letters, coordinates start dates, builds onboarding plans, sends welcome kits.', prompts: ['Draft offer letter', 'Onboarding plan', 'First day checklist', 'Welcome kit', 'Schedule start'] },
  { id: 'nina', name: 'Nina', icon: '🌱', role: 'Culture & Onboarding', dept: 'people', description: 'Manages culture fit assessment, new hire onboarding experience, first-week checklists, and team integration.', prompts: ['Culture assessment', 'Onboarding checklist', 'Team intro', '30-day plan', 'New hire report'] },

  // OPERATIONS
  { id: 'atlas', name: 'Atlas', icon: '🗺️', role: 'Project Manager', dept: 'ops', description: 'Creates project plans, tracks task status, flags blockers, assigns work, generates weekly ops reports.', prompts: ['Create project plan', 'Update task status', 'Flag blockers', 'Weekly ops report', 'Assign tasks'] },
  { id: 'cal', name: 'Cal', icon: '📅', role: 'Calendar Agent', dept: 'ops', description: 'Schedules meetings, blocks focus time, sends invites, checks availability, reschedules calls.', prompts: ['Schedule meeting', 'Block focus time', 'Send invite', 'Check availability', 'Reschedule call'] },
  { id: 'dean', name: 'Dean', icon: '🗒️', role: 'Notes & Docs Agent', dept: 'ops', description: 'Summarises meetings, files notes, creates SOPs, drafts internal docs, updates the company wiki.', prompts: ['Summarise meeting', 'File notes', 'Create doc', 'Draft SOP', 'Update wiki'] },
  { id: 'iris', name: 'Iris', icon: '📥', role: 'Inbox Agent', dept: 'ops', description: 'Triages email, flags urgent messages, drafts replies, unsubscribes spam, delivers daily email summaries.', prompts: ['Triage inbox', 'Flag urgent emails', 'Draft reply', 'Unsubscribe spam', 'Email summary'] },
  { id: 'owen', name: 'Owen', icon: '🔄', role: 'Task Coordinator', dept: 'ops', description: 'Tracks cross-team tasks, coordinates dependencies between departments, follows up on outstanding items.', prompts: ['Track tasks', 'Coordinate depts', 'Follow up', 'Task report', 'Dependency map'] },

  // FINANCE
  { id: 'bill', name: 'Bill', icon: '🧾', role: 'Invoicing Agent', dept: 'finance', description: 'Creates and sends invoices, chases overdue payments, tracks payment status, summarises revenue.', prompts: ['Send invoice', 'Chase overdue', 'Payment status', 'Create invoice', 'Revenue summary'] },
  { id: 'felix', name: 'Felix', icon: '💳', role: 'Expense Tracker', dept: 'finance', description: 'Reconciles expenses, generates monthly reports, flags anomalies, exports transaction data.', prompts: ['Reconcile expenses', 'Monthly report', 'Flag anomalies', 'Export transactions', 'Budget vs actual'] },
  { id: 'lena', name: 'Lena', icon: '⚖️', role: 'Contract Agent', dept: 'finance', description: 'Reviews contracts and NDAs, flags risky clauses, drafts agreements, summarises legal documents.', prompts: ['Review contract', 'Draft NDA', 'Flag clauses', 'Contract summary', 'Legal risk check'] },
  { id: 'reid', name: 'Reid', icon: '📐', role: 'Budget Agent', dept: 'finance', description: 'Forecasts budgets, sets spending alerts, approves expenses within thresholds, generates cash flow reports.', prompts: ['Budget forecast', 'Spending alert', 'Approve expense', 'Budget summary', 'Cash flow'] },
  { id: 'cora', name: 'Cora', icon: '🔬', role: 'Financial Review', dept: 'finance', description: 'Audits financial records, runs budget vs actual analysis, prepares reports for CEO, flags discrepancies.', prompts: ['Financial audit', 'Budget vs actual', 'Discrepancy report', 'CEO report', 'Monthly review'] },

  // INTELLIGENCE
  { id: 'roman', name: 'Roman', icon: '🏛️', role: 'Research Agent', dept: 'intelligence', description: 'Deep competitor research, market analysis, industry reports, SWOT analysis, trend identification.', prompts: ['Research competitors', 'Market analysis', 'Industry news', 'Trend report', 'SWOT analysis'] },
  { id: 'sage', name: 'Sage', icon: '📡', role: 'Market Listener', dept: 'intelligence', description: 'Monitors brand mentions, tracks keywords, watches competitor activity, sets alerts for key signals.', prompts: ['Monitor brand', 'Track keywords', 'Competitor activity', 'Social listening', 'Set alert'] },
  { id: 'nate', name: 'Nate', icon: '📰', role: 'Summary Agent', dept: 'intelligence', description: 'Compiles weekly intel digests, summarises articles and reports, extracts key takeaways, delivers news briefs.', prompts: ['Weekly summary', 'Summarise article', 'Digest report', 'Key takeaways', 'News brief'] },
  { id: 'ada', name: 'Ada', icon: '🔮', role: 'Forecasting Agent', dept: 'intelligence', description: 'Builds growth projections, Q-by-Q forecasts, scenario planning, risk analysis, revenue modelling.', prompts: ['Q2 forecast', 'Growth projection', 'Risk analysis', 'Scenario planning', 'Revenue model'] },
  { id: 'dex', name: 'Dex', icon: '📈', role: 'Trend Analyst', dept: 'intelligence', description: 'Identifies emerging trends, tracks market shifts, connects intelligence to product and marketing strategy.', prompts: ['Trend report', 'Market shift', 'Emerging signals', 'Strategy brief', 'Competitive landscape'] },

  // COMMUNITY & GROWTH
  { id: 'spike', name: 'Spike', icon: '🚀', role: 'Growth Agent', dept: 'community', description: 'Runs growth experiments, A/B tests, conversion audits, referral campaigns, waitlist strategy.', prompts: ['Growth analysis', 'A/B test idea', 'Conversion audit', 'Referral campaign', 'Waitlist strategy'] },
  { id: 'milo', name: 'Milo', icon: '🎵', role: 'Community Manager', dept: 'community', description: 'Moderates community posts, responds to members, announces events, creates member spotlights, reports on community health.', prompts: ['Moderate posts', 'Community reply', 'Event announcement', 'Member spotlight', 'Community report'] },
  { id: 'rio', name: 'Rio', icon: '🤝', role: 'Partnership Agent', dept: 'community', description: 'Identifies partnership opportunities, writes outreach, drafts collab proposals, tracks partnership pipeline.', prompts: ['Find partners', 'Partnership email', 'Collab proposal', 'Partnership summary', 'Track conversations'] },
  { id: 'zoe', name: 'Zoe', icon: '🌟', role: 'Influencer Agent', dept: 'community', description: 'Finds relevant influencers, writes outreach messages, creates influencer briefs, tracks campaign performance.', prompts: ['Find influencers', 'Draft outreach', 'Influencer brief', 'Campaign ideas', 'Contact list'] },
  { id: 'kai', name: 'Kai', icon: '🔊', role: 'Brand Amplifier', dept: 'community', description: 'Amplifies brand presence across channels, coordinates content repurposing, manages brand partnerships, tracks share-of-voice.', prompts: ['Brand amplification', 'Content repurpose', 'Share-of-voice', 'Channel strategy', 'Partnership brief'] },
];

export const getAgentsByDept = (dept: string) => AGENT_ROSTER.filter(a => a.dept === dept);
export const getAgentById = (id: string) => AGENT_ROSTER.find(a => a.id === id);
