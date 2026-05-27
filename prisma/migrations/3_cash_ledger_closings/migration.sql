-- Phase 2: team-grade petty cash ledger naming and month-end cash closing.

CREATE TYPE "public"."CashLedgerStatus" AS ENUM ('active', 'closed');

ALTER TABLE "public"."PettyCashAccount"
  ADD COLUMN "custodianUserId" UUID,
  ADD COLUMN "status" "public"."CashLedgerStatus" NOT NULL DEFAULT 'active';

UPDATE "public"."PettyCashAccount"
SET "custodianUserId" = "userId"
WHERE "custodianUserId" IS NULL;

CREATE INDEX "PettyCashAccount_custodianUserId_idx"
  ON "public"."PettyCashAccount"("custodianUserId");

ALTER TABLE "public"."PettyCashAccount"
  ADD CONSTRAINT "PettyCashAccount_custodianUserId_fkey"
  FOREIGN KEY ("custodianUserId") REFERENCES "public"."User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "public"."PettyCashClosing" (
    "id" UUID NOT NULL,
    "ledgerId" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "periodMonth" TIMESTAMP(3) NOT NULL,
    "expectedBalance" DECIMAL(12,2) NOT NULL,
    "countedCash" DECIMAL(12,2) NOT NULL,
    "difference" DECIMAL(12,2) NOT NULL,
    "financeNote" TEXT,
    "lockedByUserId" UUID NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PettyCashClosing_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PettyCashClosing_ledgerId_periodMonth_key"
  ON "public"."PettyCashClosing"("ledgerId", "periodMonth");
CREATE INDEX "PettyCashClosing_teamId_periodMonth_idx"
  ON "public"."PettyCashClosing"("teamId", "periodMonth");
CREATE INDEX "PettyCashClosing_lockedByUserId_lockedAt_idx"
  ON "public"."PettyCashClosing"("lockedByUserId", "lockedAt");

ALTER TABLE "public"."PettyCashClosing"
  ADD CONSTRAINT "PettyCashClosing_ledgerId_fkey"
  FOREIGN KEY ("ledgerId") REFERENCES "public"."PettyCashAccount"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."PettyCashClosing"
  ADD CONSTRAINT "PettyCashClosing_lockedByUserId_fkey"
  FOREIGN KEY ("lockedByUserId") REFERENCES "public"."User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."PettyCashClosing"
  ADD CONSTRAINT "PettyCashClosing_amounts_check"
  CHECK (
    "expectedBalance" >= 0
    AND "countedCash" >= 0
    AND "difference" = ("countedCash" - "expectedBalance")
  );
