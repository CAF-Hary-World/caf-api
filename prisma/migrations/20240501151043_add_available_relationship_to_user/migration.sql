/*
  Warnings:

  - You are about to drop the column `available` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Available` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[availableId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Available` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Available" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "available",
ADD COLUMN     "availableId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Available_userId_key" ON "Available"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_availableId_key" ON "User"("availableId");

-- AddForeignKey
ALTER TABLE "Available" ADD CONSTRAINT "Available_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
