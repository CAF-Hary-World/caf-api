import { mockedOwner, mockedUser, mockedVisitants } from '../mock';
import { prisma } from '../prismaClient';

async function createVisitant() {
  console.log('creating visitants...');

  const user = await prisma.user.create({
    data: {
      name: mockedUser.name,
      available: {
        create: {
          status: 'ALLOWED',
        },
      },
      role: { connect: { name: 'OWNER' } },
      owner: {
        create: {
          ...mockedOwner,
          visitantsCreated: {
            createMany: {
              data: mockedVisitants,
            },
          },
        },
      },
    },
    select: {
      owner: {
        select: {
          visitantsCreated: true,
          visitantsOnOwner: { select: { visitant: true } },
        },
      },
    },
  });

  await prisma.available.createMany({
    data: user.owner.visitantsCreated.map((visitant) => ({
      status: 'PROCESSING',
      visitantId: visitant.id,
    })),
  });

  const availables = await prisma.available.findMany({
    where: {
      visitantId: {
        in: user.owner.visitantsCreated.map((visitant) => visitant.id),
      },
    },
  });

  await prisma.justification.update({
    where: { description: 'Aguardando confirmação do email' },
    data: {
      availables: {
        createMany: {
          data: availables.map((available) => ({ availableId: available.id })),
        },
      },
    },
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
