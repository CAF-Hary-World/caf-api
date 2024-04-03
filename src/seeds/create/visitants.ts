import { mockedOwner, mockedUser, mockedVisitants } from '../mock';
import { prisma } from '../prismaClient';

async function createVisitant() {
  console.log('creating visitants...');

  const user = await prisma.user.create({
    data: {
      name: mockedUser.name,
      available: true,
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
    select: {
      owner: {
        select: { visitants: true },
      },
    },
  });

  await prisma.available.createMany({
    data: user.owner.visitants.map((visitant) => ({
      status: 'PROCESSING',
      justifications: ['Documentação pendente'],
      visitantId: visitant.id,
    })),
  });

  return user;
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
