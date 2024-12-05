/*
  Warnings:

  - A unique constraint covering the columns `[availableId]` on the table `Justification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Justification_availableId_key" ON "Justification"("availableId");
