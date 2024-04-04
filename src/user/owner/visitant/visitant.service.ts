import { visitantsInMemory } from './../../../libs/memory-cache';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ownerInMemory,
  ownerVisitantInMemory,
  ownerVisitantsInMemory,
  ownersInMemory,
  userInMemory,
  usersInMemory,
  visitantInMemory,
} from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnerVisitantService {
  private readonly selectScope = {
    owner: {
      select: {
        visitantsOnOwner: {
          select: {
            visitant: {
              select: {
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
              },
            },
          },
        },
      },
    },
  };

  private resetCache() {
    userInMemory.clear();
    usersInMemory.clear();
    ownerInMemory.clear();
    ownersInMemory.clear();
    ownerVisitantInMemory.clear();
    ownerVisitantsInMemory.clear();
    visitantInMemory.clear();
    visitantsInMemory.clear();
  }

  constructor(private readonly prisma: PrismaService) {}

  async listVisitants({ id, ownerId }: { id: string; ownerId: string }) {
    const reference = `user${id}-owner-${ownerId}-visitant`;

    try {
      if (!ownerVisitantsInMemory.hasItem(reference)) {
        ownerVisitantsInMemory.storeExpiringItem(
          reference,
          await this.prisma.user.findMany({
            where: {
              id,
              owner: { id: ownerId },
            },
            orderBy: { name: 'desc' },
            select: this.selectScope,
          }),
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return ownerVisitantsInMemory.retrieveItemValue(reference);
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
}