-- CreateTable
CREATE TABLE "VisitantsOnResident" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "visitantId" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,

    CONSTRAINT "VisitantsOnResident_pkey" PRIMARY KEY ("residentId","visitantId")
);

-- AddForeignKey
ALTER TABLE "VisitantsOnResident" ADD CONSTRAINT "VisitantsOnResident_visitantId_fkey" FOREIGN KEY ("visitantId") REFERENCES "Visitant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitantsOnResident" ADD CONSTRAINT "VisitantsOnResident_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
