-- Migration 008: Product Update Foundations

-- 1. Update agents table
ALTER TABLE public.agents 
  ADD COLUMN IF NOT EXISTS csuite_title text,
  ADD COLUMN IF NOT EXISTS is_department_head boolean DEFAULT false;

-- 2. Update organizations table
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS autonomous_mode boolean DEFAULT false;

-- 3. Update departments table with operating_mode
ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS operating_mode text DEFAULT 'build_it_for_me' 
    CHECK (operating_mode IN ('build_it_for_me', 'build_with_me'));

-- 4. Set titles for existing department heads (Optional since seed logic handles it)
UPDATE public.agents SET
  csuite_title = 'Chief Marketing Officer',
  is_department_head = true
WHERE lower(name) = 'aria';

UPDATE public.agents SET
  csuite_title = 'Chief Sales Officer',
  is_department_head = true
WHERE lower(name) = 'rex';

UPDATE public.agents SET
  csuite_title = 'Chief Customer Officer',
  is_department_head = true
WHERE lower(name) = 'purity';

UPDATE public.agents SET
  csuite_title = 'Chief Intelligence Officer',
  is_department_head = true
WHERE lower(name) = 'roman';

UPDATE public.agents SET
  csuite_title = 'Chief Technology Officer',
  is_department_head = true
WHERE lower(name) = 'ghost';

-- 5. Note: Full agent purge/re-seed should be handled via the seed script
-- to ensure all org-specific department linkage is correct.
