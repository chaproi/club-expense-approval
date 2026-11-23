-- Additive upgrade: retain existing request/event identities and timestamps.
ALTER TYPE "ExpenseStatus" ADD VALUE 'RETURNED';
ALTER TYPE "RequestEventType" ADD VALUE 'RETURNED';
ALTER TYPE "RequestEventType" ADD VALUE 'EDITED';
ALTER TYPE "RequestEventType" ADD VALUE 'RESUBMITTED';
ALTER TABLE "ExpenseRequest" ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ExpenseRequest" ADD CONSTRAINT "ExpenseRequest_revision_check" CHECK ("revision" >= 0);
