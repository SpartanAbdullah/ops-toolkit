-- Phase 0 production-safety foundation.
-- Keeps the current app architecture, but adds database guardrails for the two
-- operational modules: petty cash and overtime.

ALTER TYPE "public"."AppRole" ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE "public"."AppRole" ADD VALUE IF NOT EXISTS 'supervisor';
ALTER TYPE "public"."AppRole" ADD VALUE IF NOT EXISTS 'finance';

ALTER TYPE "public"."TeamMemberRole" ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE "public"."TeamMemberRole" ADD VALUE IF NOT EXISTS 'supervisor';
ALTER TYPE "public"."TeamMemberRole" ADD VALUE IF NOT EXISTS 'finance';

CREATE TYPE "public"."OperationalModule" AS ENUM ('petty_cash', 'overtime');

CREATE TABLE "public"."OperationalPeriodLock" (
    "id" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "module" "public"."OperationalModule" NOT NULL,
    "periodMonth" TIMESTAMP(3) NOT NULL,
    "lockedByUserId" UUID NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationalPeriodLock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OperationalPeriodLock_teamId_module_periodMonth_key"
  ON "public"."OperationalPeriodLock"("teamId", "module", "periodMonth");
CREATE INDEX "OperationalPeriodLock_lockedByUserId_lockedAt_idx"
  ON "public"."OperationalPeriodLock"("lockedByUserId", "lockedAt");
CREATE INDEX "OperationalPeriodLock_teamId_module_lockedAt_idx"
  ON "public"."OperationalPeriodLock"("teamId", "module", "lockedAt");

ALTER TABLE "public"."OperationalPeriodLock"
  ADD CONSTRAINT "OperationalPeriodLock_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."OperationalPeriodLock"
  ADD CONSTRAINT "OperationalPeriodLock_lockedByUserId_fkey"
  FOREIGN KEY ("lockedByUserId") REFERENCES "public"."User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "PettyCashTransaction_one_active_opening_balance_idx"
  ON "public"."PettyCashTransaction"("accountId")
  WHERE "type" = 'opening_balance' AND "voidedAt" IS NULL;

ALTER TABLE "public"."PettyCashTransaction"
  ADD CONSTRAINT "PettyCashTransaction_amount_policy_check"
  CHECK (
    ("type" = 'adjustment' AND "amount" <> 0)
    OR ("type" <> 'adjustment' AND "amount" > 0)
  );

ALTER TABLE "public"."OvertimeEntry"
  ADD CONSTRAINT "OvertimeEntry_minutes_policy_check"
  CHECK (
    "startTimeMinutes" >= 0
    AND "startTimeMinutes" <= 1439
    AND "endTimeMinutes" >= 0
    AND "endTimeMinutes" <= 1439
    AND "totalWorkedMinutes" > 0
    AND "totalWorkedMinutes" <= 1440
    AND "overtimeMinutes" >= 0
    AND "dayOvertimeMinutes" >= 0
    AND "nightOvertimeMinutes" >= 0
    AND ("dayOvertimeMinutes" + "nightOvertimeMinutes") <= "overtimeMinutes"
  );

ALTER TABLE "public"."OvertimeEntry"
  ADD CONSTRAINT "OvertimeEntry_approval_state_check"
  CHECK (
    (
      "status" IN ('approved', 'auto_approved')
      AND "approvedWorkedMinutes" IS NOT NULL
      AND "approvedOvertimeMinutes" IS NOT NULL
      AND "approvedOvertimeAmount" IS NOT NULL
    )
    OR (
      "status" NOT IN ('approved', 'auto_approved')
    )
  );

ALTER TABLE "public"."OvertimePaymentRecord"
  ADD CONSTRAINT "OvertimePaymentRecord_paid_until_required_check"
  CHECK ("paidUntilDate" IS NOT NULL);

CREATE OR REPLACE FUNCTION "public"."ops_period_month"(input_date TIMESTAMP)
RETURNS TIMESTAMP
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT date_trunc('month', input_date)::timestamp;
$$;

CREATE OR REPLACE FUNCTION "public"."ops_assert_period_unlocked"(
  lock_team_id UUID,
  lock_module "public"."OperationalModule",
  lock_date TIMESTAMP
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "public"."OperationalPeriodLock"
    WHERE "teamId" = lock_team_id
      AND "module" = lock_module
      AND "periodMonth" = "public"."ops_period_month"(lock_date)
  ) THEN
    RAISE EXCEPTION 'Operational period is locked for module % and date %', lock_module, lock_date
      USING ERRCODE = '23514';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."ops_petty_cash_period_lock_guard"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  ledger_team_id UUID;
BEGIN
  SELECT "teamId" INTO ledger_team_id
  FROM "public"."PettyCashAccount"
  WHERE "id" = COALESCE(NEW."accountId", OLD."accountId");

  IF ledger_team_id IS NOT NULL THEN
    PERFORM "public"."ops_assert_period_unlocked"(
      ledger_team_id,
      'petty_cash',
      COALESCE(NEW."occurredAt", OLD."occurredAt")
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER "PettyCashTransaction_period_lock_guard"
BEFORE INSERT OR UPDATE ON "public"."PettyCashTransaction"
FOR EACH ROW EXECUTE FUNCTION "public"."ops_petty_cash_period_lock_guard"();

CREATE OR REPLACE FUNCTION "public"."ops_overtime_entry_period_lock_guard"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF COALESCE(NEW."teamId", OLD."teamId") IS NOT NULL THEN
    PERFORM "public"."ops_assert_period_unlocked"(
      COALESCE(NEW."teamId", OLD."teamId"),
      'overtime',
      COALESCE(NEW."workedDate", OLD."workedDate")
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER "OvertimeEntry_period_lock_guard"
BEFORE INSERT OR UPDATE ON "public"."OvertimeEntry"
FOR EACH ROW EXECUTE FUNCTION "public"."ops_overtime_entry_period_lock_guard"();

CREATE OR REPLACE FUNCTION "public"."ops_overtime_payment_requires_approval"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "public"."OvertimeEntry"
    WHERE "teamId" IS NOT DISTINCT FROM NEW."teamId"
      AND "workerUserId" = NEW."workerUserId"
      AND "workedDate" <= NEW."paidUntilDate"
      AND "status" IN ('approved', 'auto_approved')
  ) THEN
    RAISE EXCEPTION 'Cannot mark overtime paid without approved overtime entries'
      USING ERRCODE = '23514';
  END IF;

  IF NEW."teamId" IS NOT NULL THEN
    PERFORM "public"."ops_assert_period_unlocked"(NEW."teamId", 'overtime', NEW."paidUntilDate");
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER "OvertimePaymentRecord_requires_approval"
BEFORE INSERT OR UPDATE ON "public"."OvertimePaymentRecord"
FOR EACH ROW EXECUTE FUNCTION "public"."ops_overtime_payment_requires_approval"();
