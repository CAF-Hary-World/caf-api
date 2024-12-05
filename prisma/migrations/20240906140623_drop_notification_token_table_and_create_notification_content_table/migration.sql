/*
  Warnings:

  - You are about to drop the column `body` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `notificationTokenId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `seen` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the `NotificationToken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `notificationContentId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_notificationTokenId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationToken" DROP CONSTRAINT "NotificationToken_userId_fkey";

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
ALTER TABLE "Notification" DROP COLUMN "body",
DROP COLUMN "notificationTokenId",
DROP COLUMN "seen",
DROP COLUMN "title",
ADD COLUMN     "notificationContentId" TEXT NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
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
ALTER TABLE "Visitant" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "VisitantsOnOwner" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "VisitantsOnResident" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- DropTable
DROP TABLE "NotificationToken";

-- CreateTable
CREATE TABLE "NotificationContent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() - '3 hours'::interval),
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() - '3 hours'::interval),
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "NotificationContent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_notificationContentId_fkey" FOREIGN KEY ("notificationContentId") REFERENCES "NotificationContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
