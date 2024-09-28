import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { selectVisitant, visitantsInMemory } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetUsers } from 'src/utils/resetCache';
import { timeStampISOTime } from 'src/utils/time';

@Injectable()
export class ResidentVisitantService {
  private readonly selectScope = selectVisitant;
  private resetCache = resetUsers;

  constructor(private readonly prisma: PrismaService) {}

  async listVisitants({
    id,
    residentId,
    page = 1,
    name,
    cpf,
    allowed,
    blocked,
    pending,
    processing,
  }: {
    id: string;
    residentId: string;
    page: number;
    name?: string;
    cpf?: string;
    blocked?: string;
    allowed?: string;
    processing?: string;
    pending?: string;
  }) {
    const reference = `user-${id}-owner-${residentId}-visitant-${page}-${name}-${cpf}-${allowed}-${blocked}-${pending}-${processing}`;

    const perPage =
      process.env.ENV === 'development'
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
      residentsOnVisitants: {
        some: {
          residentId,
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
          resident: {
            connect: { id: visitant.invitedBy },
          },
          residentsOnVisitants: {
            create: {
              residentId: visitant.invitedBy,
            },
          },
          available: {
            create: {
              status: 'PROCESSING',
            },
          },
        },
      });

      await this.prisma.resident.update({
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
      throw error;
    }
  }

  async removeVisitant({
    visitantId,
    id,
    residentId,
  }: {
    id: string;
    residentId: string;
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
          resident: {
            id: residentId,
          },
        },
        data: {
          resident: {
            update: {
              updatedAt: timeStampISOTime,
              visitantsOnResident: {
                delete: {
                  residentId_visitantId: {
                    residentId,
                    visitantId: visitant.id,
                  },
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
    residentId,
  }: {
    id: string;
    residentId: string;
    cpf: string;
  }) {
    try {
      await this.prisma.user.update({
        where: {
          id,
          resident: {
            id: residentId,
          },
        },
        data: {
          resident: {
            update: {
              updatedAt: timeStampISOTime,
              visitantsOnResident: {
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
