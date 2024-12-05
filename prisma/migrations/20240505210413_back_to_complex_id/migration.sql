/*
  Warnings:

  - The primary key for the `JustificationCategories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `JustificationCategories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JustificationCategories" DROP CONSTRAINT "JustificationCategories_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "JustificationCategories_pkey" PRIMARY KEY ("justificationId", "categoryId");
