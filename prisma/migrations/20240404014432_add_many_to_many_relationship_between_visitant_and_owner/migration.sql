-- CreateTable
CREATE TABLE "VisitantsOnOwner" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "visitantId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "VisitantsOnOwner_pkey" PRIMARY KEY ("ownerId","visitantId")
);

-- AddForeignKey
ALTER TABLE "VisitantsOnOwner" ADD CONSTRAINT "VisitantsOnOwner_visitantId_fkey" FOREIGN KEY ("visitantId") REFERENCES "Visitant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitantsOnOwner" ADD CONSTRAINT "VisitantsOnOwner_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
