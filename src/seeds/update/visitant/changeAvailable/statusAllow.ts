import { prisma } from '../../../prismaClient';

async function statusAllow() {
  const visitant = await prisma.visitant.findFirstOrThrow({
    where: { name: { contains: 'Seeded 0' } },
    include: { available: { include: { justifications: true } } },
  });

  await prisma.visitant.update({
    where: { id: visitant.id },
    data: {
      available: {
        update: {
          status: 'ALLOWED',
          justifications: {
            disconnect: {
              id: visitant.available.justifications.find(
                (justification) =>
                  justification.availableId === visitant.availableId,
              ).id,
            },
          },
        },
      },
    },
  });
}

statusAllow()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
