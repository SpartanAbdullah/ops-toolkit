-- Optional Supabase RLS strategy for Ops Toolkit.
--
-- The current application uses Prisma from a trusted Next.js server runtime, so
-- the enforced production path is server-side authorization in lib/app/authorization.ts
-- plus database constraints/triggers in migrations.
--
-- If direct Supabase table access is ever enabled for browser/mobile clients,
-- enable RLS and use policies like these. Do not enable these blindly while the
-- Prisma runtime connects as a table owner unless the app sets per-request auth
-- claims for Postgres.

CREATE OR REPLACE FUNCTION public.ops_is_team_member(target_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."TeamMember"
    WHERE "teamId" = target_team_id
      AND "userId" = (SELECT auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.ops_has_team_role(target_team_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public."TeamMember"
    WHERE "teamId" = target_team_id
      AND "userId" = (SELECT auth.uid())
      AND "role"::TEXT = ANY(allowed_roles)
  );
$$;

-- Example policy shape:
--
-- ALTER TABLE public."OvertimeEntry" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY overtime_entry_team_select
--   ON public."OvertimeEntry"
--   FOR SELECT
--   TO authenticated
--   USING (
--     public.ops_has_team_role("teamId", ARRAY['owner','admin','supervisor','finance'])
--     OR "workerUserId" = (SELECT auth.uid())
--   );
--
-- ALTER TABLE public."PettyCashAccount" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY petty_cash_account_finance_select
--   ON public."PettyCashAccount"
--   FOR SELECT
--   TO authenticated
--   USING (public.ops_has_team_role("teamId", ARRAY['owner','admin','supervisor','finance']));
--
-- ALTER TABLE public."PettyCashTransaction" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY petty_cash_transaction_finance_select
--   ON public."PettyCashTransaction"
--   FOR SELECT
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1
--       FROM public."PettyCashAccount" a
--       WHERE a."id" = "accountId"
--         AND public.ops_has_team_role(a."teamId", ARRAY['owner','admin','supervisor','finance'])
--     )
--   );
