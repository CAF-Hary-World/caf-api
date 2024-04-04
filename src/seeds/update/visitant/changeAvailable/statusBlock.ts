import { prisma } from 'src/seeds/prismaClient';

async function changeStatusToBlock() {
  const user = await prisma.user.findFirstOrThrow({
    where: { name: { contains: 'Seeded' } },
  });

  // await prisma.visitant.update({where: {

  // }})
  console.log(user);
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
