import { prisma } from 'src/seeds/prismaClient';

async function changeStatusToBlock() {
  await prisma.user.findFirstOrThrow({
    where: { name: { contains: 'Seeded' } },
  });
}
changeStatusToBlock()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
