/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Visitant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnh]` on the table `Visitant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invitationByOwner]` on the table `Visitant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invitationByResident]` on the table `Visitant` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Visitant" ADD COLUMN     "invitationByOwner" TEXT,
ADD COLUMN     "invitationByResident" TEXT,
ADD COLUMN     "invited" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "InvitationByOwner" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "visitantId" TEXT NOT NULL,

    CONSTRAINT "InvitationByOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationByResident" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "residentId" TEXT NOT NULL,
    "visitantId" TEXT NOT NULL,

    CONSTRAINT "InvitationByResident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Visitant_email_key" ON "Visitant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Visitant_cnh_key" ON "Visitant"("cnh");

-- CreateIndex
CREATE UNIQUE INDEX "Visitant_invitationByOwner_key" ON "Visitant"("invitationByOwner");

-- CreateIndex
CREATE UNIQUE INDEX "Visitant_invitationByResident_key" ON "Visitant"("invitationByResident");

-- AddForeignKey
ALTER TABLE "InvitationByOwner" ADD CONSTRAINT "InvitationByOwner_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationByOwner" ADD CONSTRAINT "InvitationByOwner_visitantId_fkey" FOREIGN KEY ("visitantId") REFERENCES "Visitant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationByResident" ADD CONSTRAINT "InvitationByResident_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationByResident" ADD CONSTRAINT "InvitationByResident_visitantId_fkey" FOREIGN KEY ("visitantId") REFERENCES "Visitant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
