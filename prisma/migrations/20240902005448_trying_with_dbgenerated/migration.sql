-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Available" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "AvailablesJustifications" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "InvitationByOwner" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "InvitationByResident" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Justification" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "JustificationCategories" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "NotificationToken" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Owner" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Permission" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Resident" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Root" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Visitant" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "VisitantsOnOwner" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "VisitantsOnResident" ALTER COLUMN "createdAt" SET DEFAULT (NOW() - '3 hours'::interval),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);
