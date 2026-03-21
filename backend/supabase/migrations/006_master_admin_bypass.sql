-- ============================================================
-- 006_master_admin_bypass.sql
-- Grants permanent Enterprise access to the Nexonic master admin account.
-- Runs idempotently — safe to apply even if the account doesn't exist yet.
-- ============================================================

-- If nexonicindustries@gmail.com already has an org, upgrade it to enterprise
-- and set plan_expires_at to the year 2124 (effectively never expires).
UPDATE public.organizations
SET
  plan = 'enterprise',
  plan_expires_at = '2124-01-01T00:00:00Z',
  paystack_subscription_code = NULL -- no subscription needed
WHERE owner_id IN (
  SELECT id FROM public.profiles
  WHERE lower(email) = 'nexonicindustries@gmail.com'
);
