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
ALTER TABLE "Visitant" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "VisitantsOnOwner" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- AlterTable
ALTER TABLE "VisitantsOnResident" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DEFAULT (NOW() - '3 hours'::interval);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() - '3 hours'::interval),
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() - '3 hours'::interval),
    "name" TEXT NOT NULL,
    "logo" TEXT,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() - '3 hours'::interval),
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() - '3 hours'::interval),
    "name" TEXT NOT NULL,
    "kind" "KIND",
    "plate" TEXT,
    "document" TEXT NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePermission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() - '3 hours'::interval),
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT (NOW() - '3 hours'::interval),
    "providerId" TEXT,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "ServicePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");

-- AddForeignKey
ALTER TABLE "ServicePermission" ADD CONSTRAINT "ServicePermission_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePermission" ADD CONSTRAINT "ServicePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePermission" ADD CONSTRAINT "ServicePermission_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
