/*
  Warnings:

  - You are about to drop the column `justification` on the `Available` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Available" DROP COLUMN "justification",
ADD COLUMN     "justifications" JSONB;
