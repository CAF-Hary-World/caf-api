import { prisma } from '../prismaClient';

async function deleteVisitants() {
  await prisma.user.deleteMany({
    where: {
      name: {
        contains: 'Seeded',
      },
    },
  });
  await prisma.user.findMany();
  return;
}

deleteVisitants()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
