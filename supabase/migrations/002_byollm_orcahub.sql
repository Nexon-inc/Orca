-- BYOLLM: LLM Configs table
CREATE TABLE IF NOT EXISTS public.llm_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  scope text NOT NULL CHECK (scope IN ('org', 'department', 'agent')),
  department_key text CHECK (department_key IN (
    'marketing','sales','cs','tech','hiring',
    'ops','finance','intel','community'
  )),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN (
    'orca_default',
    'gemini',
    'groq',
    'openai',
    'anthropic',
    'mistral',
    'ollama',
    'deepseek',
    'perplexity',
    'cohere'
  )),
  model text NOT NULL,
  api_key_encrypted text,
  base_url text,
  temperature numeric(3,2) DEFAULT 0.7,
  max_tokens integer DEFAULT 4000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(org_id, scope, department_key, agent_id)
);

ALTER TABLE public.llm_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "llm_configs_owner_cofounder"
  ON public.llm_configs FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'cofounder')
    )
  );

-- OrcaHub: Templates, Installs, and Pending Briefs
CREATE TABLE IF NOT EXISTS public.orcahub_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  template_data jsonb NOT NULL,
  author text NOT NULL DEFAULT 'orca_official',
  plan_required text NOT NULL DEFAULT 'free',
  installs integer NOT NULL DEFAULT 0,
  preview_image_url text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.orcahub_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_public_read"
  ON public.orcahub_templates FOR SELECT USING (published = true);

CREATE TABLE IF NOT EXISTS public.orcahub_installs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  template_id uuid REFERENCES public.orcahub_templates(id) NOT NULL,
  installed_by uuid REFERENCES public.profiles(id) NOT NULL,
  customizations jsonb DEFAULT '{}',
  installed_at timestamptz DEFAULT now(),
  UNIQUE(org_id, template_id)
);

ALTER TABLE public.orcahub_installs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "installs_org_members"
  ON public.orcahub_installs FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS public.pending_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  brief_text text NOT NULL,
  rationale text,
  source text DEFAULT 'orcahub',
  template_slug text,
  dismissed boolean DEFAULT false,
  sent boolean DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pending_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pending_briefs_org_members"
  ON public.pending_briefs FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Helper function for incrementing installs
CREATE OR REPLACE FUNCTION public.increment_template_installs(p_template_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.orcahub_templates
  SET installs = installs + 1
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
