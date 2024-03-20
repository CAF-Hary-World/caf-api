/*
  Warnings:

  - The `justifications` column on the `Available` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `code` on the `Visitant` table. All the data in the column will be lost.
  - You are about to drop the column `invitedBy` on the `Visitant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Visitant" DROP CONSTRAINT "visitant_owner_fkey";

-- DropForeignKey
ALTER TABLE "Visitant" DROP CONSTRAINT "visitant_resident_fkey";

-- DropIndex
DROP INDEX "Visitant_code_key";

-- DropIndex
DROP INDEX "Visitant_invitedBy_idx";

-- AlterTable
ALTER TABLE "Available" DROP COLUMN "justifications",
ADD COLUMN     "justifications" TEXT[];

-- AlterTable
ALTER TABLE "Visitant" DROP COLUMN "code",
DROP COLUMN "invitedBy",
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "residentId" TEXT;

-- AddForeignKey
ALTER TABLE "Visitant" ADD CONSTRAINT "Visitant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitant" ADD CONSTRAINT "Visitant_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
