/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Visitant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Visitant_code_key" ON "Visitant"("code");
