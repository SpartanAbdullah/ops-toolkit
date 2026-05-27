-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AppRole" AS ENUM ('individual', 'worker', 'admin');

-- CreateEnum
CREATE TYPE "public"."TeamMemberRole" AS ENUM ('worker', 'admin');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('info', 'success', 'warning');

-- CreateEnum
CREATE TYPE "public"."PettyCashTransactionType" AS ENUM ('opening_balance', 'cash_top_up', 'expense_cash', 'expense_card', 'reimbursement_submitted', 'reimbursement_received', 'adjustment', 'card_settlement');

-- CreateEnum
CREATE TYPE "public"."PettyCashPaymentMethod" AS ENUM ('cash', 'card', 'bank_transfer', 'other');

-- CreateEnum
CREATE TYPE "public"."PettyCashTransactionStatus" AS ENUM ('posted', 'pending', 'received');

-- CreateEnum
CREATE TYPE "public"."PettyCashReimbursementStatus" AS ENUM ('not_applicable', 'pending', 'received');

-- CreateEnum
CREATE TYPE "public"."OvertimeCalculationMode" AS ENUM ('simple', 'mohre_compliant');

-- CreateEnum
CREATE TYPE "public"."OvertimeEntryStatus" AS ENUM ('pending', 'approved', 'rejected', 'auto_approved');

-- CreateEnum
CREATE TYPE "public"."OvertimeApprovalDecision" AS ENUM ('approved', 'rejected', 'partially_approved');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."AppRole" NOT NULL DEFAULT 'individual',
    "activeTeamId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profile" (
    "userId" UUID NOT NULL,
    "fullName" TEXT,
    "phone" TEXT,
    "timezone" TEXT DEFAULT 'Asia/Dubai',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."Team" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamMember" (
    "id" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "public"."TeamMemberRole" NOT NULL DEFAULT 'worker',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamInviteCode" (
    "id" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "createdByUserId" UUID,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamInviteCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" UUID NOT NULL,
    "teamId" UUID,
    "actorUserId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "teamId" UUID,
    "type" "public"."NotificationType" NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PettyCashAccount" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "teamId" UUID,
    "name" TEXT NOT NULL DEFAULT 'Primary Petty Cash',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'AED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PettyCashAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PettyCashTransaction" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "type" "public"."PettyCashTransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category" TEXT NOT NULL,
    "vendorPayee" TEXT,
    "paymentMethod" "public"."PettyCashPaymentMethod",
    "notes" TEXT,
    "referenceNumber" TEXT,
    "receiptReference" TEXT,
    "status" "public"."PettyCashTransactionStatus" NOT NULL DEFAULT 'posted',
    "reimbursementStatus" "public"."PettyCashReimbursementStatus" NOT NULL DEFAULT 'not_applicable',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PettyCashTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OvertimeSettings" (
    "id" UUID NOT NULL,
    "teamId" UUID,
    "ownerUserId" UUID,
    "calculationMode" "public"."OvertimeCalculationMode" NOT NULL DEFAULT 'simple',
    "standardDailyHours" DECIMAL(5,2) NOT NULL DEFAULT 8,
    "simpleHourlyRate" DECIMAL(10,2),
    "weekendDays" TEXT[],
    "ramadanEnabled" BOOLEAN NOT NULL DEFAULT false,
    "ramadanStartDate" TIMESTAMP(3),
    "ramadanEndDate" TIMESTAMP(3),
    "individualBasicMonthlySalary" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OvertimeSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OvertimeWorkerProfile" (
    "id" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "workerUserId" UUID NOT NULL,
    "basicMonthlySalary" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OvertimeWorkerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OvertimeHolidayDate" (
    "id" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "label" TEXT,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OvertimeHolidayDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OvertimeEntry" (
    "id" UUID NOT NULL,
    "teamId" UUID,
    "workerUserId" UUID NOT NULL,
    "workedDate" TIMESTAMP(3) NOT NULL,
    "startTimeMinutes" INTEGER NOT NULL,
    "endTimeMinutes" INTEGER NOT NULL,
    "overnight" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "calculationMode" "public"."OvertimeCalculationMode" NOT NULL,
    "standardDailyHours" DECIMAL(5,2) NOT NULL,
    "fixedHourlyRate" DECIMAL(10,2),
    "basicMonthlySalary" DECIMAL(12,2),
    "totalWorkedMinutes" INTEGER NOT NULL,
    "overtimeMinutes" INTEGER NOT NULL,
    "dayOvertimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "nightOvertimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "calculatedOvertimeAmount" DECIMAL(12,2) NOT NULL,
    "isWeekend" BOOLEAN NOT NULL DEFAULT false,
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "ramadanApplied" BOOLEAN NOT NULL DEFAULT false,
    "wellbeingWarning" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."OvertimeEntryStatus" NOT NULL DEFAULT 'pending',
    "approvedWorkedMinutes" INTEGER,
    "approvedOvertimeMinutes" INTEGER,
    "approvedOvertimeAmount" DECIMAL(12,2),
    "lastDecisionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OvertimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OvertimeApproval" (
    "id" UUID NOT NULL,
    "entryId" UUID NOT NULL,
    "approverUserId" UUID NOT NULL,
    "decision" "public"."OvertimeApprovalDecision" NOT NULL,
    "comment" TEXT,
    "approvedWorkedMinutes" INTEGER,
    "approvedOvertimeMinutes" INTEGER,
    "approvedOvertimeAmount" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OvertimeApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OvertimePaymentRecord" (
    "id" UUID NOT NULL,
    "teamId" UUID,
    "workerUserId" UUID NOT NULL,
    "markedByUserId" UUID NOT NULL,
    "paidUntilDate" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OvertimePaymentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_activeTeamId_idx" ON "public"."User"("activeTeamId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_slug_key" ON "public"."Team"("slug");

-- CreateIndex
CREATE INDEX "Team_ownerId_idx" ON "public"."Team"("ownerId");

-- CreateIndex
CREATE INDEX "TeamMember_userId_idx" ON "public"."TeamMember"("userId");

-- CreateIndex
CREATE INDEX "TeamMember_teamId_idx" ON "public"."TeamMember"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "public"."TeamMember"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInviteCode_code_key" ON "public"."TeamInviteCode"("code");

-- CreateIndex
CREATE INDEX "TeamInviteCode_teamId_revokedAt_idx" ON "public"."TeamInviteCode"("teamId", "revokedAt");

-- CreateIndex
CREATE INDEX "AuditLog_teamId_createdAt_idx" ON "public"."AuditLog"("teamId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "public"."AuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "public"."Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_teamId_idx" ON "public"."Notification"("teamId");

-- CreateIndex
CREATE INDEX "PettyCashAccount_teamId_idx" ON "public"."PettyCashAccount"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "PettyCashAccount_userId_key" ON "public"."PettyCashAccount"("userId");

-- CreateIndex
CREATE INDEX "PettyCashTransaction_accountId_occurredAt_idx" ON "public"."PettyCashTransaction"("accountId", "occurredAt");

-- CreateIndex
CREATE INDEX "PettyCashTransaction_createdByUserId_occurredAt_idx" ON "public"."PettyCashTransaction"("createdByUserId", "occurredAt");

-- CreateIndex
CREATE INDEX "PettyCashTransaction_type_occurredAt_idx" ON "public"."PettyCashTransaction"("type", "occurredAt");

-- CreateIndex
CREATE INDEX "PettyCashTransaction_reimbursementStatus_occurredAt_idx" ON "public"."PettyCashTransaction"("reimbursementStatus", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "OvertimeSettings_teamId_key" ON "public"."OvertimeSettings"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "OvertimeSettings_ownerUserId_key" ON "public"."OvertimeSettings"("ownerUserId");

-- CreateIndex
CREATE INDEX "OvertimeWorkerProfile_workerUserId_idx" ON "public"."OvertimeWorkerProfile"("workerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "OvertimeWorkerProfile_teamId_workerUserId_key" ON "public"."OvertimeWorkerProfile"("teamId", "workerUserId");

-- CreateIndex
CREATE INDEX "OvertimeHolidayDate_teamId_date_idx" ON "public"."OvertimeHolidayDate"("teamId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "OvertimeHolidayDate_teamId_date_key" ON "public"."OvertimeHolidayDate"("teamId", "date");

-- CreateIndex
CREATE INDEX "OvertimeEntry_teamId_workedDate_idx" ON "public"."OvertimeEntry"("teamId", "workedDate");

-- CreateIndex
CREATE INDEX "OvertimeEntry_workerUserId_workedDate_idx" ON "public"."OvertimeEntry"("workerUserId", "workedDate");

-- CreateIndex
CREATE INDEX "OvertimeEntry_status_workedDate_idx" ON "public"."OvertimeEntry"("status", "workedDate");

-- CreateIndex
CREATE INDEX "OvertimeApproval_entryId_createdAt_idx" ON "public"."OvertimeApproval"("entryId", "createdAt");

-- CreateIndex
CREATE INDEX "OvertimeApproval_approverUserId_createdAt_idx" ON "public"."OvertimeApproval"("approverUserId", "createdAt");

-- CreateIndex
CREATE INDEX "OvertimePaymentRecord_teamId_workerUserId_paidUntilDate_idx" ON "public"."OvertimePaymentRecord"("teamId", "workerUserId", "paidUntilDate");

-- CreateIndex
CREATE INDEX "OvertimePaymentRecord_workerUserId_paidUntilDate_idx" ON "public"."OvertimePaymentRecord"("workerUserId", "paidUntilDate");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_activeTeamId_fkey" FOREIGN KEY ("activeTeamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamInviteCode" ADD CONSTRAINT "TeamInviteCode_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamInviteCode" ADD CONSTRAINT "TeamInviteCode_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PettyCashAccount" ADD CONSTRAINT "PettyCashAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PettyCashAccount" ADD CONSTRAINT "PettyCashAccount_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PettyCashTransaction" ADD CONSTRAINT "PettyCashTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."PettyCashAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PettyCashTransaction" ADD CONSTRAINT "PettyCashTransaction_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OvertimeSettings" ADD CONSTRAINT "OvertimeSettings_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OvertimeSettings" ADD CONSTRAINT "OvertimeSettings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OvertimeWorkerProfile" ADD CONSTRAINT "OvertimeWorkerProfile_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OvertimeWorkerProfile" ADD CONSTRAINT "OvertimeWorkerProfile_workerUserId_fkey" FOREIGN KEY ("workerUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OvertimeHolidayDate" ADD CONSTRAINT "OvertimeHolidayDate_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OvertimeHolidayDate" ADD CONSTRAINT "OvertimeHolidayDate_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OvertimeEntry" ADD CONSTRAINT "OvertimeEntry_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OvertimeEntry" ADD CONSTRAINT "OvertimeEntry_workerUserId_fkey" FOREIGN KEY ("workerUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OvertimeApproval" ADD CONSTRAINT "OvertimeApproval_approverUserId_fkey" FOREIGN KEY ("approverUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OvertimeApproval" ADD CONSTRAINT "OvertimeApproval_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."OvertimeEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OvertimePaymentRecord" ADD CONSTRAINT "OvertimePaymentRecord_markedByUserId_fkey" FOREIGN KEY ("markedByUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OvertimePaymentRecord" ADD CONSTRAINT "OvertimePaymentRecord_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OvertimePaymentRecord" ADD CONSTRAINT "OvertimePaymentRecord_workerUserId_fkey" FOREIGN KEY ("workerUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

