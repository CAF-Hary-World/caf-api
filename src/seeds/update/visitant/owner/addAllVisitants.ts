import { mockedOwner } from '../../../mock';
import { prisma } from '../../../prismaClient';

async function addAllVisitants() {
  const visitants = await prisma.visitant.findMany({
    where: {
      name: { contains: 'Seeded' },
    },
  });

  await prisma.owner.update({
    where: {
      email: mockedOwner.email,
    },
    data: {
      visitantsOnOwner: {
        createMany: {
          data: visitants.map((visitant) => ({ visitantId: visitant.id })),
        },
      },
    },
  });
}

addAllVisitants()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
