import { timeStampISOTime } from 'src/utils/time';
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
      updatedAt: timeStampISOTime,
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
