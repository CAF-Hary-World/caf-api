import { mockedUser } from '../mock';
import { prisma } from '../prismaClient';

async function deleteVisitants() {
  console.log('DELETING = ', mockedUser.name);
  const usersBefore = await prisma.user.findMany();
  console.log('users before = ', usersBefore);

  const { count } = await prisma.user.deleteMany({
    where: {
      name: {
        contains: 'Seeded',
      },
    },
  });
  const usersAfter = await prisma.user.findMany();
  console.log('Total deleted = ', count);
  console.log('users after = ', usersAfter);
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
