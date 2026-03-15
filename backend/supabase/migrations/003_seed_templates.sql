-- Seed Official OrcaHub Templates
INSERT INTO public.orcahub_templates (slug, name, description, category, plan_required, template_data)
VALUES 
('saas-startup', 'SaaS Startup', 'Lean setup for early-stage software companies.', 'startup', 'free', '{
  "departments": [
    {"key": "marketing", "agent_mode": "approve_first"},
    {"key": "sales", "agent_mode": "approve_first"},
    {"key": "tech", "agent_mode": "autopilot"},
    {"key": "ops", "agent_mode": "autopilot"}
  ],
  "day1_briefs": [
    {"agent_name": "Aria", "brief": "Write 5 LinkedIn posts introducing our product. Founder tone.", "rationale": "Activate social presence immediately."},
    {"agent_name": "Rex", "brief": "Find 20 SaaS founders in our ICP.", "rationale": "Start the sales pipeline."},
    {"agent_name": "Ghost", "brief": "Scan our main repository for security vulnerabilities.", "rationale": "Ensure security from day one."},
    {"agent_name": "Atlas", "brief": "Create a launch week project plan.", "rationale": "Organize the team."}
  ],
  "suggested_integrations": ["github", "linkedin", "hubspot", "notion", "slack"]
}'),
('marketing-agency', 'Content Marketing Agency', 'Optimized for high-volume content and creative production.', 'marketing', 'starter', '{
  "departments": [
    {"key": "marketing", "agent_mode": "autopilot"},
    {"key": "intel", "agent_mode": "approve_first"},
    {"key": "community", "agent_mode": "approve_first"},
    {"key": "ops", "agent_mode": "autopilot"}
  ],
  "day1_briefs": [
    {"agent_name": "Jackie", "brief": "Write a 1,200-word blog post about AI tools.", "rationale": "High-value SEO content."},
    {"agent_name": "Lucy", "brief": "Run an SEO audit of our main website.", "rationale": "Improve search rankings."},
    {"agent_name": "Roman", "brief": "Research the top 5 competitors.", "rationale": "Market awareness."}
  ],
  "suggested_integrations": ["linkedin", "wordpress", "ahrefs", "notion", "google_analytics"]
}');

-- More templates can be added here following the same pattern
