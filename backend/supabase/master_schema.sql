-- ============================================================
-- ORCA MASTER DATABASE INITIALIZATION (TEST)
-- Consolidates Migrations 001 - 005 + Auth Sync Fixes
-- ============================================================

-- ─── 0. EXTENSIONS ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 1. CORE TABLES ──────────────────────────────────────────

-- Profiles (User Identity)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  username text UNIQUE,
  country text,
  avatar_initials text GENERATED ALWAYS AS (upper(left(full_name, 1))) STORED,
  job_title text,
  timezone text DEFAULT 'UTC',
  language text DEFAULT 'en',
  signup_ip inet,
  email_normalized text UNIQUE,
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
  paystack_customer_code text UNIQUE,
  paystack_subscription_code text UNIQUE,
  onboarding_completed boolean NOT NULL DEFAULT false,
  onboarding_step integer NOT NULL DEFAULT 1,
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
  department_key text CHECK (department_key IN ('marketing','sales','cs','tech','hiring','ops','finance','intel','community')),
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
  brand_voice text CHECK (brand_voice IN ('professional','casual','bold','friendly','technical','authoritative')),
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

CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  key text NOT NULL CHECK (key IN ('marketing','sales','cs','tech','hiring','ops','finance','intel','community')),
  name text NOT NULL,
  icon text NOT NULL,
  head_user_id uuid REFERENCES public.profiles(id),
  agent_mode text NOT NULL DEFAULT 'approve_first' CHECK (agent_mode IN ('autopilot','approve_first','suggest_only')),
  agents_paused boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(org_id, key)
);

CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text NOT NULL,
  acronym text NOT NULL,
  role_description text NOT NULL,
  status text NOT NULL DEFAULT 'idle' CHECK (status IN ('active','busy','idle')),
  tasks_today integer DEFAULT 0,
  last_action text,
  last_active_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ─── 3. COMMUNICATION ───────────────────────────────────────

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
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','blocked')),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- ─── 4. TRIGGERS ─────────────────────────────────────────────

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

-- ─── 5. RLS ──────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_own_profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_members_view_org" ON public.organizations FOR SELECT USING (id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_members_view_members" ON public.org_members FOR SELECT USING (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));
