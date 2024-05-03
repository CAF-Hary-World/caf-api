-- DropIndex
DROP INDEX "Justification_availableId_key";

-- AlterTable
ALTER TABLE "Justification" ALTER COLUMN "availableId" DROP NOT NULL;
