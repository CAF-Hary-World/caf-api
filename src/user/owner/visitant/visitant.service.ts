import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  selectVisitant,
  visitantInMemory,
  visitantsInMemory,
} from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetUsers } from 'src/utils/resetCache';
import { timeStampISOTime } from 'src/utils/time';

@Injectable()
export class OwnerVisitantService {
  private readonly selectScope = selectVisitant;

  private resetCache = resetUsers;

  constructor(private readonly prisma: PrismaService) {}

  async listVisitants({
    id,
    ownerId,
    page = 1,
    name,
    cpf,
    allowed,
    blocked,
    pending,
    processing,
  }: {
    id: string;
    ownerId: string;
    page: number;
    name?: string;
    cpf?: string;
    blocked?: string;
    allowed?: string;
    processing?: string;
    pending?: string;
  }) {
    const reference = `user-${id}-owner-${ownerId}-visitant-${page}-${name}-${cpf}-${allowed}-${blocked}-${pending}-${processing}`;

    const perPage =
      process.env.NODE_ENV === 'development'
        ? 2
        : Number(process.env.DEFAULT_PER_PAGE);

    const where: Prisma.VisitantWhereInput = {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(cpf && { cpf: { contains: cpf } }),
      ...(allowed && { available: { status: 'ALLOWED' } }),
      ...(blocked && { available: { status: 'BLOCKED' } }),
      ...(processing && { available: { status: 'PROCESSING' } }),
      ...(pending && {
        available: {
          justifications: {
            some: {
              justification: {
                description: 'Confirmação com a administração',
              },
            },
          },
        },
      }),
      ownersOnVisitants: {
        some: {
          ownerId,
        },
      },
    };

    const visitantsCount = await this.prisma.visitant.count({
      where,
    });

    const totalPages = Math.ceil(visitantsCount / perPage);

    try {
      if (!visitantsInMemory.hasItem(reference)) {
        const visitants = await this.prisma.visitant.findMany({
          where,
          orderBy: { name: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
          select: {
            ...this.selectScope,
            permissions: {
              where: {
                ...this.selectScope.permissions.where,
                user: {
                  id,
                },
              },
            },
          },
        });

        visitantsInMemory.storeExpiringItem(
          reference,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          visitants,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return {
        resource: visitantsInMemory.retrieveItemValue(reference),
        totalPages,
      };
    } catch (error) {
      console.error('Visitante List Service =', error);

      throw error;
    }
  }

  async getVisitant({
    userId,
    visitantId,
  }: {
    userId: string;
    visitantId: string;
  }) {
    const reference = `user-${userId}-owner-visitant-${visitantId}`;
    try {
      if (!visitantInMemory.hasItem(reference)) {
        const visitant = await this.prisma.visitant.findUniqueOrThrow({
          where: {
            id: visitantId,
            owner: {
              user: {
                id: userId,
              },
            },
          },
          select: this.selectScope,
        });

        visitantInMemory.storeExpiringItem(
          reference,
          visitant,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return visitantInMemory.retrieveItemValue(reference);
    } catch (error) {
      console.error('Visitante GET Service =', error);

      throw error;
    }
  }

  async createVisitant({
    visitant,
  }: {
    visitant: Prisma.VisitantCreateInput & { invitedBy: string };
  }) {
    try {
      const visitantCreated = await this.prisma.visitant.create({
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
              justifications: {
                create: {
                  justification: {
                    connect: {
                      description: 'Documentação pendente',
                    },
                  },
                },
              },
            },
          },
        },
      });

      await this.prisma.owner.update({
        where: {
          id: visitant.invitedBy,
        },
        data: {
          visitantsCreated: {
            connect: {
              id: visitantCreated.id,
            },
          },
        },
      });

      return this.resetCache();
    } catch (error) {
      console.error('Visitante Create Service = ', error);

      throw error;
    }
  }

  async removeVisitant({
    visitantId,
    id,
    ownerId,
  }: {
    id: string;
    ownerId: string;
    visitantId: string;
  }) {
    try {
      const visitant = await this.prisma.visitant.findUniqueOrThrow({
        where: {
          id: visitantId,
        },
      });
      await this.prisma.user.update({
        where: {
          id,
          owner: {
            id: ownerId,
          },
        },
        data: {
          owner: {
            update: {
              updatedAt: timeStampISOTime,
              visitantsOnOwner: {
                delete: {
                  ownerId_visitantId: { ownerId, visitantId: visitant.id },
                },
              },
            },
          },
        },
      });
      return this.resetCache();
    } catch (error) {
      console.error('Visitante Remove Service = ', error);

      throw error;
    }
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
    try {
      await this.prisma.user.update({
        where: {
          id,
          owner: {
            id: ownerId,
          },
        },
        data: {
          owner: {
            update: {
              updatedAt: timeStampISOTime,
              visitantsOnOwner: {
                create: {
                  visitant: { connect: { cpf } },
                },
              },
            },
          },
        },
      });

      return this.resetCache();
    } catch (error) {
      console.error('Visitante Add Service = ', error);

      throw error;
    }
  }
}
