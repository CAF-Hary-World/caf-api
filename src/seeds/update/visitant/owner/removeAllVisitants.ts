import { prisma } from '../../../prismaClient';

async function removeAllVisitants() {
  const visitants = await prisma.visitant.findMany({
    where: {
      name: { contains: 'Seeded' },
    },
  });

  await prisma.visitantsOnOwner.deleteMany({
    where: {
      visitantId: { in: visitants.map((visitant) => visitant.id) },
    },
  });
}

removeAllVisitants()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
