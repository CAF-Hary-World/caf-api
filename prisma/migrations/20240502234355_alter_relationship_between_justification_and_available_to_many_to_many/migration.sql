/*
  Warnings:

  - You are about to drop the column `availableId` on the `Justification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Justification" DROP CONSTRAINT "Justification_availableId_fkey";

-- AlterTable
ALTER TABLE "Justification" DROP COLUMN "availableId";

-- CreateTable
CREATE TABLE "AvailablesJustifications" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "availableId" TEXT NOT NULL,
    "justificationId" TEXT NOT NULL,

    CONSTRAINT "AvailablesJustifications_pkey" PRIMARY KEY ("availableId","justificationId")
);

-- AddForeignKey
ALTER TABLE "AvailablesJustifications" ADD CONSTRAINT "AvailablesJustifications_availableId_fkey" FOREIGN KEY ("availableId") REFERENCES "Available"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailablesJustifications" ADD CONSTRAINT "AvailablesJustifications_justificationId_fkey" FOREIGN KEY ("justificationId") REFERENCES "Justification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
