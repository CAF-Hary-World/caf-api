import { mockedOwner, mockedUser, mockedVisitants } from '../mock';
import { prisma } from '../prismaClient';

async function createVisitant() {
  console.log('creating visitants...');

  return await prisma.user.create({
    data: {
      name: mockedUser.name,
      role: { connect: { name: 'OWNER' } },
      owner: {
        create: {
          ...mockedOwner,
          visitants: {
            createMany: {
              data: mockedVisitants,
            },
          },
        },
      },
    },
  });
}

createVisitant()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
