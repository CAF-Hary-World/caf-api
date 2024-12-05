/*
  Warnings:

  - You are about to drop the column `invitationByOwner` on the `Visitant` table. All the data in the column will be lost.
  - You are about to drop the column `invitationByResident` on the `Visitant` table. All the data in the column will be lost.
  - You are about to drop the `InvitationByOwner` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvitationByResident` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InvitationByOwner" DROP CONSTRAINT "InvitationByOwner_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "InvitationByOwner" DROP CONSTRAINT "InvitationByOwner_visitantId_fkey";

-- DropForeignKey
ALTER TABLE "InvitationByResident" DROP CONSTRAINT "InvitationByResident_residentId_fkey";

-- DropForeignKey
ALTER TABLE "InvitationByResident" DROP CONSTRAINT "InvitationByResident_visitantId_fkey";

-- DropIndex
DROP INDEX "Visitant_invitationByOwner_key";

-- DropIndex
DROP INDEX "Visitant_invitationByResident_key";

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
ALTER TABLE "Visitant" DROP COLUMN "invitationByOwner",
DROP COLUMN "invitationByResident",
ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "VisitantsOnOwner" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "VisitantsOnResident" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- DropTable
DROP TABLE "InvitationByOwner";

-- DropTable
DROP TABLE "InvitationByResident";
