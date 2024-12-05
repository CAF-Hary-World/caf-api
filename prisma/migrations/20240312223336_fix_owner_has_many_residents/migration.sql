/*
  Warnings:

  - You are about to drop the column `residentId` on the `Owner` table. All the data in the column will be lost.
  - You are about to drop the column `residents` on the `Owner` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Owner" DROP COLUMN "residentId",
DROP COLUMN "residents";
