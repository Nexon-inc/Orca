-- 1. Create Agent Memory Table
CREATE TABLE IF NOT EXISTS public.llm_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  memory_data JSONB NOT NULL DEFAULT '{"key_learnings": [], "context_summary": ""}',
  message_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, agent_id)
);

-- 2. Consolidate and Update OrcaHub Templates
TRUNCATE TABLE public.orcahub_templates;

INSERT INTO public.orcahub_templates (slug, name, description, category, plan_required, template_data)
VALUES 
(
  'startup', 
  'STARTUP_OS', 
  'The complete Autonomous OS for early-stage software companies. Deploys all 6 Core Executives.', 
  'STARTUP', 
  'free', 
  '{
    "departments": ["marketing", "sales", "cs", "tech", "ops", "intel"],
    "executives": ["ATLAS", "ARIA", "REX", "PURITY", "ROMAN", "GHOST"]
  }'
),
(
  'marketing', 
  'MARKETING_OS', 
  'High-performance marketing engine with full executive oversight.', 
  'MARKETING', 
  'free', 
  '{
    "departments": ["marketing", "ops", "intel", "cs"],
    "executives": ["ARIA", "ATLAS", "ROMAN", "PURITY"]
  }'
),
(
  'e-commerce', 
  'E-COMMERCE_OS', 
  'DTC retail powerhouse for scaling physical and digital brands.', 
  'E-COMMERCE', 
  'free', 
  '{
    "departments": ["sales", "cs", "ops", "marketing"],
    "executives": ["REX", "PURITY", "ATLAS", "ARIA"]
  }'
),
(
  'dev-studio', 
  'DEV_STUDIO_OS', 
  'Technical first OS for shipping projects and maintaining high security standards.', 
  'DEV_STUDIO', 
  'free', 
  '{
    "departments": ["tech", "ops", "intel"],
    "executives": ["GHOST", "ATLAS", "ROMAN"]
  }'
),
(
  'creator', 
  'CREATOR_OS', 
  'Personal brand and audience growth engine for modern creators.', 
  'CREATOR', 
  'free', 
  '{
    "departments": ["marketing", "community", "intel"],
    "executives": ["ARIA", "ATLAS", "ROMAN"]
  }'
);
