-- Official Protocol Consolidation: 6 Core Executives
-- This script replaces placeholder templates with consolidated configurations using only the 6 Core Executives.

-- SaaS Startup
INSERT INTO public.orcahub_templates (slug, name, description, category, tags, plan_required, template_data, published)
VALUES ('saas-startup', 'SaaS Startup', 'For solo founders and early-stage SaaS teams. Activates Marketing, Sales, Tech, and Ops with core executive protocols ready to go.', 'saas_startup', ARRAY['startup','saas','founders'], 'free', '{
  "departments": [
    {"key":"marketing","agent_mode":"approve_first","priority":"high","description":"Brand voice, social media, and SEO generation","active_agents":["Aria"]},
    {"key":"sales","agent_mode":"approve_first","priority":"high","description":"Lead prospecting and outreach pipelines","active_agents":["Rex"]},
    {"key":"tech","agent_mode":"autopilot","priority":"medium","description":"Codebase security and system health monitoring","active_agents":["Ghost"]},
    {"key":"ops","agent_mode":"autopilot","priority":"medium","description":"Executive coordination and project management","active_agents":["Atlas"]}
  ],
  "day1_briefs": [
    {"agent_name":"Aria","brief":"Write 5 LinkedIn posts introducing our product with a founder tone. Generate 10 SEO keywords for our landing page.","rationale":"Aria establishes your brand voice and search visibility immediately."},
    {"agent_name":"Rex","brief":"Find 20 founders in our ICP who have posted about operational challenges in the last 30 days.","rationale":"Rex builds your first lead pipeline with warm, high-intent prospects."},
    {"agent_name":"Ghost","brief":"Scan our main repository for security vulnerabilities and monitor system health hooks.","rationale":"Ghost ensures your code is secure and your servers are healthy from day one."},
    {"agent_name":"Atlas","brief":"Coordinate the launch week project plan and synchronize all executive assignments.","rationale":"Atlas provides the high-level coordination to keep the team moving."}
  ]
}', true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  template_data = EXCLUDED.template_data,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags;

-- Content Marketing Agency
INSERT INTO public.orcahub_templates (slug, name, description, category, tags, plan_required, template_data, published)
VALUES ('marketing-agency', 'Content Marketing Agency', 'For agencies running high-volume content and social for clients. Activates Marketing, Intelligence, and Ops.', 'marketing_agency', ARRAY['agency','marketing','content','seo'], 'starter', '{
  "departments": [
    {"key":"marketing","agent_mode":"approve_first","priority":"high","description":"Social media publishing and brand voice consistency","active_agents":["Aria"]},
    {"key":"intel","agent_mode":"autopilot","priority":"medium","description":"Deep web market and competitor research","active_agents":["Roman"]},
    {"key":"ops","agent_mode":"autopilot","priority":"low","description":"Client project and task management coordination","active_agents":["Atlas"]}
  ],
  "day1_briefs": [
    {"agent_name":"Aria","brief":"Generate a 1,200-word blog post about the top 5 AI tools for small business. SEO-optimised for client review.","rationale":"Aria produces high-quality content that sets the bar for the agency."},
    {"agent_name":"Roman","brief":"Perform deep web research on our top 5 competitors. Summarise their content strategy and technology stack.","rationale":"Roman builds the competitive intelligence report for your strategy."},
    {"agent_name":"Atlas","brief":"Construct a client onboarding workflow and assign first tasks to the marketing team.","rationale":"Atlas streamlines the agency operations for new client intake."}
  ]
}', true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  template_data = EXCLUDED.template_data,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags;

-- E-commerce Operator
INSERT INTO public.orcahub_templates (slug, name, description, category, tags, plan_required, template_data, published)
VALUES ('ecommerce-operator', 'E-commerce Operator', 'For DTC brands and online stores. Activates Marketing, Sales, Customer Success, and Ops.', 'ecommerce', ARRAY['ecommerce','dtc','retail','shopify'], 'starter', '{
  "departments": [
    {"key":"marketing","agent_mode":"approve_first","priority":"high","description":"Ad copy generation and social media campaigns","active_agents":["Aria"]},
    {"key":"sales","agent_mode":"autopilot","priority":"high","description":"Revenue pipeline and outreach analytics","active_agents":["Rex"]},
    {"key":"cs","agent_mode":"autopilot","priority":"high","description":"Customer support tickets and retention flows","active_agents":["Purity"]},
    {"key":"ops","agent_mode":"approve_first","priority":"medium","description":"Operational coordinating and logistics setup","active_agents":["Atlas"]}
  ],
  "day1_briefs": [
    {"agent_name":"Aria","brief":"Draft 3 Facebook ad copy variants and 5 Instagram captions for the product launch.","rationale":"Aria kick-starts the marketing engine for immediate traffic."},
    {"agent_name":"Rex","brief":"Analyze current revenue pipeline and identify the top 10 highest-value leads for outreach.","rationale":"Rex focuses on direct revenue generation from your first hour."},
    {"agent_name":"Purity","brief":"Initialize the customer onboarding flow and parse latest user feedback for retention signals.","rationale":"Purity ensures your first customers have an elite experience."},
    {"agent_name":"Atlas","brief":"Establish the logistics coordination plan and sync all revenue hooks for tracking.","rationale":"Atlas ensures the entire machine is synchronized for scaling."}
  ]
}', true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  template_data = EXCLUDED.template_data,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags;

-- Recruiting Firm
INSERT INTO public.orcahub_templates (slug, name, description, category, tags, plan_required, template_data, published)
VALUES ('recruiting-firm', 'Recruiting Firm', 'For boutique recruitment agencies. Activates Sales, Intelligence, and Ops with a hiring-first setup.', 'recruiting_firm', ARRAY['recruiting','hiring','hr','talent'], 'pro', '{
  "departments": [
    {"key":"sales","agent_mode":"approve_first","priority":"high","description":"Client prospecting and candidate outreach","active_agents":["Rex"]},
    {"key":"intel","agent_mode":"autopilot","priority":"medium","description":"Market analysis and deep talent research","active_agents":["Roman"]},
    {"key":"ops","agent_mode":"autopilot","priority":"low","description":"Candidate coordination and hiring workflow management","active_agents":["Atlas"]}
  ],
  "day1_briefs": [
    {"agent_name":"Rex","brief":"Find 10 fast-growing startups in our ICP and initiate outreach to their HR leads.","rationale":"Rex builds your client prospect list with high-growth targets."},
    {"agent_name":"Roman","brief":"Perform deep web research on the senior engineering talent pool in East Africa.","rationale":"Roman builds the intelligence base for your sourcing team."},
    {"agent_name":"Atlas","brief":"Create a standard screening scorecard and candidate onboarding workflow.","rationale":"Atlas standardises the hiring process for consistent results."}
  ]
}', true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  template_data = EXCLUDED.template_data,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags;

-- Dev Agency
INSERT INTO public.orcahub_templates (slug, name, description, category, tags, plan_required, template_data, published)
VALUES ('dev-agency', 'Dev Agency', 'For software development agencies. Activates Tech, Ops, and Sales with a developer-first configuration.', 'dev_agency', ARRAY['dev','agency','software','engineering'], 'pro', '{
  "departments": [
    {"key":"tech","agent_mode":"approve_first","priority":"high","description":"Code reviews, system health, and security monitors","active_agents":["Ghost"]},
    {"key":"ops","agent_mode":"autopilot","priority":"high","description":"Project management and dev workflow coordination","active_agents":["Atlas"]},
    {"key":"sales","agent_mode":"approve_first","priority":"medium","description":"Lead gen and client outreach analytics","active_agents":["Rex"]}
  ],
  "day1_briefs": [
    {"agent_name":"Ghost","brief":"Scan the client repository for vulnerabilities and establish system health monitoring.","rationale":"Ghost ensures technical excellence and security from the start."},
    {"agent_name":"Atlas","brief":"Set up the development project board and coordinate first sprint task assignments.","rationale":"Atlas provides the structure needed for high-velocity shipping."},
    {"agent_name":"Rex","brief":"Lead prospecting for companies that recently announced funding and need development support.","rationale":"Rex keeps the project pipeline full of high-value clients."}
  ]
}', true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  template_data = EXCLUDED.template_data,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags;

-- Intelligence & Research
INSERT INTO public.orcahub_templates (slug, name, description, category, tags, plan_required, template_data, published)
VALUES ('intelligence-research-desk', 'Intelligence & Research Desk', 'For research teams and think tanks. Activates Intelligence and Ops for deep market and competitive research.', 'intelligence', ARRAY['research','intelligence','competitive','analysis'], 'pro', '{
  "departments": [
    {"key":"intel","agent_mode":"autopilot","priority":"high","description":"Research, signals, summaries, and forecasting","active_agents":["Roman"]},
    {"key":"ops","agent_mode":"autopilot","priority":"low","description":"Project management and documentation coordination","active_agents":["Atlas"]}
  ],
  "day1_briefs": [
    {"agent_name":"Roman","brief":"Perform deep web research on the AI agent management market and identify key competitors.","rationale":"Roman builds the foundational intelligence for your entire operation."},
    {"agent_name":"Atlas","brief":"Organize the research project timeline and manage the final report documentation flow.","rationale":"Atlas ensures your research is structured and delivered on time."}
  ]
}', true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  template_data = EXCLUDED.template_data,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags;
