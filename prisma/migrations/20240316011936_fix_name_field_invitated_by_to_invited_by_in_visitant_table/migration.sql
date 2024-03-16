/*
  Warnings:

  - You are about to drop the column `invitatedById` on the `Visitant` table. All the data in the column will be lost.
  - Added the required column `invitedBy` to the `Visitant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Visitant" DROP CONSTRAINT "visitant_owner_fkey";

-- DropForeignKey
ALTER TABLE "Visitant" DROP CONSTRAINT "visitant_resident_fkey";

-- DropIndex
DROP INDEX "Visitant_invitatedById_idx";

-- AlterTable
ALTER TABLE "Visitant" DROP COLUMN "invitatedById",
ADD COLUMN     "invitedBy" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Visitant_invitedBy_idx" ON "Visitant"("invitedBy");

-- AddForeignKey
ALTER TABLE "Visitant" ADD CONSTRAINT "visitant_owner_fkey" FOREIGN KEY ("invitedBy") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitant" ADD CONSTRAINT "visitant_resident_fkey" FOREIGN KEY ("invitedBy") REFERENCES "Resident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
