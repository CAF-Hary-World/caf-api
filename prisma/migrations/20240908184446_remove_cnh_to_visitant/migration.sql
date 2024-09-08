/*
  Warnings:

  - You are about to drop the column `cnh` on the `Visitant` table. All the data in the column will be lost.
  - You are about to drop the column `cnhURL` on the `Visitant` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Visitant_cnh_key";

-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "Available" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "AvailablesJustifications" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "InvitationByOwner" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "InvitationByResident" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "Justification" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "JustificationCategories" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "Owner" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "Permission" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "Resident" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "Root" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "Visitant" DROP COLUMN "cnh",
DROP COLUMN "cnhURL",
ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "VisitantsOnOwner" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "VisitantsOnResident" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);
