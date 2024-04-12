import { visitantsInMemory } from './../../../libs/memory-cache';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ownerInMemory,
  ownersInMemory,
  userInMemory,
  usersInMemory,
  visitantInMemory,
} from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnerVisitantService {
  private readonly selectScope = {
    available: true,
    name: true,
    cnh: true,
    cpf: true,
    documentUrl: true,
    email: true,
    id: true,
    kind: true,
    photo: true,
    phone: true,
  };

  private resetCache() {
    userInMemory.clear();
    usersInMemory.clear();
    ownerInMemory.clear();
    ownersInMemory.clear();
    visitantInMemory.clear();
    visitantsInMemory.clear();
  }

  constructor(private readonly prisma: PrismaService) {}

  async listVisitants({
    id,
    ownerId,
    page = 1,
    name,
    cpf,
  }: {
    id: string;
    ownerId: string;
    page: number;
    name?: string;
    cpf?: string;
  }) {
    const reference = `user${id}-owner-${ownerId}-visitant-${page}-${name}-${cpf}`;

    const perPage = 10;

    try {
      if (!visitantsInMemory.hasItem(reference)) {
        const visitants = await this.prisma.visitant.findMany({
          where: {
            ownersOnVisitants: {
              some: {
                owner: {
                  id: ownerId,
                  userId: id,
                },
              },
            },
            ...(name && { name: { contains: name } }),
            ...(cpf && { cpf: { contains: cpf } }),
          },
          orderBy: { name: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
          select: this.selectScope,
        });
        console.log('visitants (no-cache) ', visitants);

        visitantsInMemory.storeExpiringItem(
          reference,
          visitants,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return visitantsInMemory.retrieveItemValue(reference);
    } catch (error) {
      console.log('Visitante List Service =', error);

      throw new Error(error);
    }
  }

  async createVisitant({
    visitant,
  }: {
    visitant: Prisma.VisitantCreateInput & { invitedBy: string };
  }) {
    this.resetCache();

    try {
      return await this.prisma.visitant.create({
        data: {
          cpf: visitant.cpf,
          kind: visitant.kind,
          name: visitant.name,
          phone: visitant.phone,
          owner: {
            connect: { id: visitant.invitedBy },
          },
          ownersOnVisitants: {
            create: {
              ownerId: visitant.invitedBy,
            },
          },
          available: {
            create: {
              status: 'PROCESSING',
            },
          },
        },
      });
    } catch (error) {
      console.log('Visitante Create Service = ', error);

      throw new Error(error);
    }
  }

  async removeVisitant({
    cpf,
    id,
    ownerId,
  }: {
    id: string;
    ownerId: string;
    cpf: string;
  }) {
    this.resetCache();

    const visitant = await this.prisma.visitant.findUniqueOrThrow({
      where: {
        cpf,
      },
    });

    return await this.prisma.user.update({
      where: {
        id,
        owner: {
          id: ownerId,
        },
      },
      data: {
        owner: {
          update: {
            visitantsOnOwner: {
              delete: {
                ownerId_visitantId: { ownerId, visitantId: visitant.id },
              },
            },
          },
        },
      },
      select: this.selectScope,
    });
  }

  async addVisitant({
    cpf,
    id,
    ownerId,
  }: {
    id: string;
    ownerId: string;
    cpf: string;
  }) {
    this.resetCache();
    return await this.prisma.user.update({
      where: {
        id,
        owner: {
          id: ownerId,
        },
      },
      data: {
        owner: {
          update: {
            visitantsOnOwner: {
              create: {
                visitant: { connect: { cpf } },
              },
            },
          },
        },
      },
    });
  }

  async updateAvailableStatus({
    cpf,
    id,
    ownerId,
    justifications,
  }: {
    id: string;
    ownerId: string;
    cpf: string;
    justifications: Array<string>;
  }) {
    this.resetCache();
    console.log('update available status');

    //  IF visitant belongs to owner
    await this.prisma.user.findUniqueOrThrow({
      where: {
        id,
        owner: {
          id: ownerId,
          visitantsOnOwner: {
            some: {
              visitant: {
                cpf,
              },
            },
          },
        },
      },
    });

    const visitant = await this.prisma.visitant.findUniqueOrThrow({
      where: {
        cpf,
      },
    });

    await this.prisma.available.update({
      where: {
        visitantId: visitant.id,
      },
      data: {
        justifications,
        status: 'PROCESSING',
      },
    });
  }
}
