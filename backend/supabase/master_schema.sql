-- ============================================================
-- ORCA MASTER DATABASE INITIALIZATION
-- Consolidates Migrations 001 - 005 + Auth Sync Fixes
-- Run this in the Supabase SQL Editor for a fresh project setup.
-- ============================================================

-- ─── 0. EXTENSIONS ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. CORE TABLES ──────────────────────────────────────────

-- Profiles (User Identity)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  username text UNIQUE, -- Added for ORCA Identity
  country text,         -- Added for ORCA Identity
  avatar_initials text GENERATED ALWAYS AS (upper(left(full_name, 1))) STORED,
  job_title text,
  timezone text DEFAULT 'UTC',
  language text DEFAULT 'en',
  signup_ip inet,       -- Security field
  email_normalized text UNIQUE, -- Security field
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organizations
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES public.profiles(id) NOT NULL,
  plan text NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free','starter','pro','enterprise')),
  plan_expires_at timestamptz,
  -- Paystack billing
  paystack_customer_code text UNIQUE,
  paystack_subscription_code text UNIQUE,
  -- Onboarding state
  onboarding_completed boolean NOT NULL DEFAULT false,
  onboarding_step integer NOT NULL DEFAULT 1,
  -- Checkout concurrency lock
  checkout_locked_at timestamptz,
  checkout_locked_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Organization Members
CREATE TABLE public.org_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner','cofounder','head','member','advisor')),
  department_key text CHECK (department_key IN (
    'marketing','sales','cs','tech','hiring','ops','finance','intel','community'
  )),
  invited_by uuid REFERENCES public.profiles(id),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- Company Identity
CREATE TABLE public.company_identity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE NOT NULL,
  company_name text,
  industry text,
  stage text CHECK (stage IN ('idea','pre_revenue','early_revenue','growth','scale')),
  mission text,
  brand_voice text CHECK (brand_voice IN (
    'professional','casual','bold','friendly','technical','authoritative'
  )),
  icp text,
  geography text,
  competitors text[],
  brand_colors jsonb DEFAULT '{"primary": "#00FF87", "secondary": "#030a06"}',
  logo_url text,
  knowledge_base_url text,
  crm_connected text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ─── 2. DEPARTMENTS & AGENTS ───────────────────────────────

-- Departments
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  key text NOT NULL CHECK (key IN (
    'marketing','sales','cs','tech','hiring','ops','finance','intel','community'
  )),
  name text NOT NULL,
  icon text NOT NULL,
  head_user_id uuid REFERENCES public.profiles(id),
  agent_mode text NOT NULL DEFAULT 'approve_first'
    CHECK (agent_mode IN ('autopilot','approve_first','suggest_only')),
  agents_paused boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(org_id, key)
);

-- Agents
CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text NOT NULL,
  acronym text NOT NULL,
  role_description text NOT NULL,
  status text NOT NULL DEFAULT 'idle'
    CHECK (status IN ('active','busy','idle')),
  tasks_today integer DEFAULT 0,
  last_action text,
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ─── 3. CONVERSATIONS & COMMUNICATION ───────────────────────

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  agent_id uuid REFERENCES public.agents(id) NOT NULL,
  department_key text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('user','agent')),
  content text NOT NULL,
  result_items jsonb,
  status text DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','blocked')),
  version integer NOT NULL DEFAULT 1, -- Optimistic locking
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.team_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  from_user_id uuid REFERENCES public.profiles(id) NOT NULL,
  to_user_id uuid REFERENCES public.profiles(id) NOT NULL,
  content text NOT NULL,
  is_system_notification boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ─── 4. COORDINATION & ECOSYSTEM ────────────────────────────

CREATE TABLE public.coordination_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  from_agent_id uuid REFERENCES public.agents(id),
  to_agent_id uuid REFERENCES public.agents(id),
  type text NOT NULL CHECK (type IN ('handoff','alert','trigger','brief')),
  description text NOT NULL,
  context jsonb,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','complete')),
  auto_approved boolean DEFAULT false,
  chain_depth integer NOT NULL DEFAULT 0,
  chain_root_event_id uuid REFERENCES public.coordination_events(id),
  chain_summary text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  initiated_by_user_id uuid REFERENCES public.profiles(id),
  initiated_by_agent_id uuid REFERENCES public.agents(id),
  target_department_key text,
  target_agent_id uuid REFERENCES public.agents(id),
  context text NOT NULL,
  urgency text NOT NULL DEFAULT 'info'
    CHECK (urgency IN ('urgent','warning','info')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','modified')),
  version integer NOT NULL DEFAULT 0,
  head_approved_by uuid REFERENCES public.profiles(id),
  head_approved_at timestamptz,
  ceo_approved boolean DEFAULT false,
  ceo_approved_at timestamptz,
  ceo_approved_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.orcahub_templates (
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

-- ─── 5. SECURITY & LIMITS ────────────────────────────────────

CREATE TABLE public.agent_action_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  action_date date NOT NULL DEFAULT current_date,
  action_count integer NOT NULL DEFAULT 0,
  limit_cap integer NOT NULL DEFAULT 50,
  UNIQUE(agent_id, action_date)
);

CREATE TABLE public.rate_limit_buckets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  bucket_key text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, bucket_key)
);

-- LLM Configs (BYOLLM)
CREATE TABLE public.llm_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  scope text NOT NULL CHECK (scope IN ('org', 'department', 'agent')),
  department_key text CHECK (department_key IN (
    'marketing','sales','cs','tech','hiring','ops','finance','intel','community'
  )),
  agent_id uuid REFERENCES public.agents(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('orca_default','gemini','groq','openai','anthropic','mistral','ollama','deepseek','perplexity','cohere')),
  model text NOT NULL,
  api_key_encrypted text,
  base_url text,
  temperature numeric(3,2) DEFAULT 0.7,
  max_tokens integer DEFAULT 4000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(org_id, scope, department_key, agent_id)
);

-- ─── 6. FUNCTIONS & TRIGGERS ─────────────────────────────────

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username, country)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'country'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Increment installs
CREATE OR REPLACE FUNCTION public.increment_template_installs(p_template_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.orcahub_templates
  SET installs = installs + 1
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Coordination Count
CREATE OR REPLACE FUNCTION get_active_coordination_count(p_org_id uuid)
RETURNS integer AS $$
  SELECT count(*)::integer
  FROM public.coordination_events
  WHERE org_id = p_org_id
    AND status = 'pending'
    AND created_at > now() - interval '5 minutes';
$$ LANGUAGE sql SECURITY DEFINER;

-- ─── 7. RLS POLICIES ─────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_own_profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_members_view_org" ON public.organizations FOR SELECT USING (id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_members_view_members" ON public.org_members FOR SELECT USING (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

-- Add more policies as needed (Consolidated from migration 002_rls_policies)

-- ─── 8. INDEXES ──────────────────────────────────────────────

CREATE INDEX idx_org_members_org_id ON public.org_members(org_id);
CREATE INDEX idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX idx_departments_org_id ON public.departments(org_id);
CREATE INDEX idx_agents_department_id ON public.agents(department_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);

-- ─── 9. SEED DATA ────────────────────────────────────────────

INSERT INTO public.orcahub_templates (slug, name, description, category, plan_required, template_data)
VALUES 
('saas-startup', 'SaaS Startup', 'Lean setup for early-stage software companies.', 'startup', 'free', '{"departments": [{"key": "marketing", "agent_mode": "approve_first"}]}'),
('marketing-agency', 'Content Marketing Agency', 'Optimized for high-volume content.', 'marketing', 'starter', '{"departments": [{"key": "marketing", "agent_mode": "autopilot"}]}');
