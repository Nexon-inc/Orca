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
  { id: 'aria', name: 'Aria', icon: '🎙️', role: 'Social Media Manager', dept: 'marketing', description: 'Plans, writes, and schedules social content. Can generate videos using [GENERATE_VIDEO: template=SocialTemplate, text=X].', prompts: ['Write 5 tweets', 'Draft LinkedIn post', 'Content calendar'] },
  { id: 'jackie', name: 'Jackie', icon: '✍️', role: 'Content Writer', dept: 'marketing', description: 'Long-form blogs, email sequences, landing page copy. Can generate summary videos using [GENERATE_VIDEO: template=BlogSummary, title=X, points=["a","b"]].', prompts: ['Write blog post', 'Email newsletter', 'Product announcement'] },
  { id: 'eric', name: 'Eric', icon: '📢', role: 'Ads Manager', dept: 'marketing', description: 'Writes ad copy, manages campaigns. Can generate videos using [GENERATE_VIDEO: template=AdTemplate, headline=X, subheadline=Y, cta=Z].', prompts: ['Facebook ad copy', 'Google ad variants', 'Retargeting copy'] },
  { id: 'lucy', name: 'Lucy', icon: '🔍', role: 'SEO Specialist', dept: 'marketing', description: 'Keyword research, meta descriptions, rank tracking, technical SEO audits, link building briefs.', prompts: ['SEO audit', 'Keyword research', 'Meta descriptions'] },
  { id: 'joe', name: 'Joe', icon: '🎨', role: 'Brand Voice', dept: 'marketing', description: 'Maintains brand guidelines, reviews all content for tone consistency, updates style guide, audits voice across channels.', prompts: ['Brand voice guide', 'Tagline options', 'Tone review'] },

  // SALES
  { id: 'rex', name: 'Rex', icon: '💰', role: 'Lead Prospector', dept: 'sales', description: 'Finds high-intent leads using hiring signals, funding data, and social activity. Builds qualified prospect lists.', prompts: ['Find 20 leads', 'Enrich contacts', 'ICP research'] },
  { id: 'clara', name: 'Clara', icon: '📋', role: 'CRM Manager', dept: 'sales', description: 'Keeps the CRM clean and updated. Logs meetings, moves deals through stages, flags overdue opportunities.', prompts: ['Update CRM', 'Pipeline report', 'Deal summary'] },
  { id: 'chase', name: 'Chase', icon: '🏃', role: 'Follow-up Agent', dept: 'sales', description: 'Sends timed follow-up sequences, re-engages cold leads, writes breakup emails, monitors reply rates.', prompts: ['Follow-up sequence', 'Re-engagement email', 'Check-in message'] },
  { id: 'mark_sales', name: 'Mark', icon: '📬', role: 'Outreach Agent', dept: 'sales', description: 'Writes personalised cold emails, subject lines, LinkedIn messages, and multi-step sequences.', prompts: ['Cold outreach email', 'LinkedIn DM', 'Sequence draft'] },
  { id: 'teo', name: 'Teo', icon: '🔭', role: 'Sales Intel', dept: 'sales', description: 'Researches target accounts, maps buyer personas, delivers competitive intel, validates ICP fit.', prompts: ['Competitor intel', 'Market signals', 'Sales brief'] },

  // CUSTOMER SUCCESS
  { id: 'purity', name: 'Purity', icon: '🛟', role: 'Support Agent', dept: 'customer', description: 'Handles incoming support tickets, drafts replies, updates FAQ, escalates critical issues, summarises support trends.', prompts: ['Draft support reply', 'FAQ update', 'Ticket summary'] },
  { id: 'bruce', name: 'Bruce', icon: '🧭', role: 'Onboarding Agent', dept: 'customer', description: 'Sends welcome sequences, walks new customers through setup, checks in at key milestones, builds onboarding guides.', prompts: ['Onboarding sequence', 'Welcome email', 'Setup guide'] },
  { id: 'nadia', name: 'Nadia', icon: '🔗', role: 'Retention Agent', dept: 'customer', description: 'Identifies churn-risk accounts, drafts retention emails, analyses usage patterns, runs win-back campaigns.', prompts: ['Retention email', 'Win-back campaign', 'Churn analysis'] },
  { id: 'john_cs', name: 'John', icon: '📊', role: 'NPS Agent', dept: 'customer', description: 'Sends NPS surveys, analyses responses, segments detractors/promoters, builds feedback reports.', prompts: ['NPS survey', 'Feedback form', 'Satisfaction report'] },
  { id: 'beatrice', name: 'Beatrice', icon: '💚', role: 'Customer Health', dept: 'customer', description: 'Tracks account health scores, flags at-risk customers before they churn, coordinates with Nadia on interventions.', prompts: ['Health score report', 'At-risk accounts', 'Success metrics'] },

  // TECH & SECURITY
  { id: 'ghost', name: 'Ghost', icon: '👻', role: 'Security Scanner', dept: 'tech', description: 'Powered by CyberGuard. Scans repos for vulnerabilities, reviews auth flows, opens fix PRs automatically.', prompts: ['Scan repository', 'Check dependencies', 'Security report'] },
  { id: 'cipher', name: 'Cipher', icon: '🔐', role: 'Code Reviewer', dept: 'tech', description: 'Reviews PRs for quality, flags tech debt, suggests refactors, architecture reviews, security pattern checks.', prompts: ['Review PR', 'Code audit', 'Review auth flow'] },
  { id: 'wren', name: 'Wren', icon: '⚙️', role: 'DevOps & Code Generation', dept: 'tech', description: 'Writes production-ready code, generates fixes, scaffolds features, manages deployments and CI/CD.', prompts: ['Deploy to staging', 'Check build', 'DevOps report'] },
  { id: 'hex', name: 'Hex', icon: '📖', role: 'Docs Agent', dept: 'tech', description: 'Writes and updates API docs, changelogs, README files, code comments, internal wikis.', prompts: ['Update README', 'Write API docs', 'Document function'] },
  { id: 'volt', name: 'Volt', icon: '⚡', role: 'Incident Response', dept: 'tech', description: 'Monitors uptime, responds to alerts, coordinates incident timelines, writes post-mortems, escalates critical issues.', prompts: ['Incident report', 'Error analysis', 'Uptime check'] },

  // PEOPLE
  { id: 'marcus', name: 'Marcus', icon: '🔎', role: 'Talent Sourcer', dept: 'people', description: 'Sources candidates from The Summit, LinkedIn, and talent networks. Builds pipelines for open roles.', prompts: ['Source candidates', 'LinkedIn search', 'Talent pipeline'] },
  { id: 'vera', name: 'Vera', icon: '🧬', role: 'Candidate Screener', dept: 'people', description: 'Screens applicants, scores applications, writes interview questions, assesses culture fit and skills.', prompts: ['Screen applicant', 'Scorecard', 'Interview questions'] },
  { id: 'zara', name: 'Zara', icon: '✅', role: 'Verification Agent', dept: 'people', description: 'Powered by Intuition. Runs background checks, reference verification, employment history, and behavioral scoring.', prompts: ['Verify background', 'Reference check', 'Employment check'] },
  { id: 'eli', name: 'Eli', icon: '📝', role: 'Offer Coordinator', dept: 'people', description: 'Drafts offer letters, coordinates start dates, builds onboarding plans, sends welcome kits.', prompts: ['Draft offer letter', 'Schedule interview', 'Rejection email'] },
  { id: 'nina', name: 'Nina', icon: '🌱', role: 'Culture & Onboarding', dept: 'people', description: 'Manages culture fit assessment, new hire onboarding experience, first-week checklists, and team integration.', prompts: ['Onboarding plan', 'Culture doc', 'First week schedule'] },

  // OPERATIONS
  { id: 'atlas', name: 'Atlas', icon: '🗺️', role: 'Project Manager', dept: 'ops', description: 'Creates project plans, tracks task status, flags blockers, assigns work, generates weekly ops reports.', prompts: ['Project plan', 'Sprint breakdown', 'Milestone tracker'] },
  { id: 'cal', name: 'Cal', icon: '📅', role: 'Calendar Agent', dept: 'ops', description: 'Schedules meetings, blocks focus time, sends invites, checks availability, reschedules calls.', prompts: ['Schedule meeting', 'Block focus time', 'Weekly agenda'] },
  { id: 'dean', name: 'Dean', icon: '🗒️', role: 'Notes & Docs Agent', dept: 'ops', description: 'Summarises meetings, files notes, creates SOPs, drafts internal docs, updates the company wiki.', prompts: ['Meeting notes', 'SOP document', 'Team update'] },
  { id: 'iris', name: 'Iris', icon: '📥', role: 'Inbox Agent', dept: 'ops', description: 'Triages email, flags urgent messages, drafts replies, unsubscribes spam, delivers daily email summaries.', prompts: ['Triage inbox', 'Draft reply', 'Email summary'] },
  { id: 'owen', name: 'Owen', icon: '🔄', role: 'Task Coordinator', dept: 'ops', description: 'Tracks cross-team tasks, coordinates dependencies between departments, follows up on outstanding items.', prompts: ['Task list', 'Process checklist', 'Coordination update'] },

  // FINANCE
  { id: 'bill', name: 'Bill', icon: '🧾', role: 'Invoicing Agent', dept: 'finance', description: 'Creates and sends invoices, chases overdue payments, tracks payment status, summarises revenue.', prompts: ['Create invoice', 'Payment reminder', 'Invoice summary'] },
  { id: 'felix', name: 'Felix', icon: '💳', role: 'Expense Tracker', dept: 'finance', description: 'Reconciles expenses, generates monthly reports, flags anomalies, exports transaction data.', prompts: ['Expense report', 'Reconcile transactions', 'Monthly spend'] },
  { id: 'lena', name: 'Lena', icon: '⚖️', role: 'Contract Agent', dept: 'finance', description: 'Reviews contracts and NDAs, flags risky clauses, drafts agreements, summarises legal documents.', prompts: ['Draft contract', 'Review agreement', 'NDA template'] },
  { id: 'reid', name: 'Reid', icon: '📐', role: 'Budget Agent', dept: 'finance', description: 'Forecasts budgets, sets spending alerts, approves expenses within thresholds, generates cash flow reports.', prompts: ['Budget forecast', 'Spend analysis', 'Q report'] },
  { id: 'cora', name: 'Cora', icon: '🔬', role: 'Financial Review', dept: 'finance', description: 'Audits financial records, runs budget vs actual analysis, prepares reports for CEO, flags discrepancies.', prompts: ['Financial audit', 'Revenue report', 'Cost breakdown'] },

  // INTELLIGENCE
  { id: 'roman', name: 'Roman', icon: '🏛️', role: 'Research Agent', dept: 'intelligence', description: 'Deep competitor research, market analysis, industry reports, SWOT analysis, trend identification.', prompts: ['Market research', 'Competitor analysis', 'Industry deep dive'] },
  { id: 'sage', name: 'Sage', icon: '📡', role: 'Market Listener', dept: 'intelligence', description: 'Monitors brand mentions, tracks keywords, watches competitor activity, sets alerts for key signals.', prompts: ['Monitor mentions', 'Signal report', 'Trend watch'] },
  { id: 'nate', name: 'Nate', icon: '📰', role: 'Summary Agent', dept: 'intelligence', description: 'Compiles weekly intel digests, summarises articles and reports, extracts key takeaways, delivers news briefs.', prompts: ['Weekly brief', 'News summary', 'Key takeaways'] },
  { id: 'ada', name: 'Ada', icon: '🔮', role: 'Forecasting Agent', dept: 'intelligence', description: 'Builds growth projections, Q-by-Q forecasts, scenario planning, risk analysis, revenue modelling.', prompts: ['Revenue forecast', 'Growth model', 'Scenario analysis'] },
  { id: 'dex', name: 'Dex', icon: '📈', role: 'Trend Analyst', dept: 'intelligence', description: 'Identifies emerging trends, tracks market shifts, connects intelligence to product and marketing strategy.', prompts: ['Trend report', 'Emerging topics', 'Opportunity scan'] },

  // COMMUNITY & GROWTH
  { id: 'spike', name: 'Spike', icon: '🚀', role: 'Growth Agent', dept: 'community', description: 'Runs growth experiments, A/B tests, conversion audits, referral campaigns, waitlist strategy.', prompts: ['Growth experiment', 'Viral hook', 'Launch strategy'] },
  { id: 'milo', name: 'Milo', icon: '🎵', role: 'Community Manager', dept: 'community', description: 'Moderates community posts, responds to members, announces events, creates member spotlights, reports on community health.', prompts: ['Community update', 'Member spotlight', 'Event post'] },
  { id: 'rio', name: 'Rio', icon: '🤝', role: 'Partnership Agent', dept: 'community', description: 'Identifies partnership opportunities, writes outreach, drafts collab proposals, tracks partnership pipeline.', prompts: ['Partnership outreach', 'Collab proposal', 'Partner brief'] },
  { id: 'zoe', name: 'Zoe', icon: '🌟', role: 'Influencer Agent', dept: 'community', description: 'Finds relevant influencers, writes outreach messages, creates influencer briefs, tracks campaign performance.', prompts: ['Influencer list', 'Outreach DM', 'Campaign brief'] },
  { id: 'kai', name: 'Kai', icon: '🔊', role: 'Brand Amplifier', dept: 'community', description: 'Amplifies brand presence across channels, coordinates content repurposing, manages brand partnerships, tracks share-of-voice.', prompts: ['Brand amplification', 'Share strategy', 'Audience growth'] },
];

export const getAgentsByDept = (dept: string) => AGENT_ROSTER.filter(a => a.dept === dept);
export const getAgentById = (id: string) => AGENT_ROSTER.find(a => a.id === id);
