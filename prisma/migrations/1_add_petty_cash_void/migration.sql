-- Soft-delete (void) support for petty cash transactions.
-- Voided rows are kept in the ledger for audit but excluded from balance calculations.

ALTER TABLE "public"."PettyCashTransaction"
  ADD COLUMN "voidedAt" TIMESTAMP(3),
  ADD COLUMN "voidedByUserId" UUID,
  ADD COLUMN "voidedReason" TEXT;

CREATE INDEX "PettyCashTransaction_voidedAt_idx"
  ON "public"."PettyCashTransaction"("voidedAt");

ALTER TABLE "public"."PettyCashTransaction"
  ADD CONSTRAINT "PettyCashTransaction_voidedByUserId_fkey"
  FOREIGN KEY ("voidedByUserId") REFERENCES "public"."User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
