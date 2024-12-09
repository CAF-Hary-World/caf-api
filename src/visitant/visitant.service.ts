import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, ROLE } from '@prisma/client';
import {
  selectVisitant,
  visitantInMemory,
  visitantsInMemory,
} from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { deleteImageByUrl } from 'src/utils/images';
import { resetUsers } from 'src/utils/resetCache';
import { timeStampISOTime } from 'src/utils/time';

@Injectable()
export class VisitantService {
  private readonly selectScope = selectVisitant;

  private resetCache = resetUsers;

  constructor(private readonly prisma: PrismaService) {}

  async getVisitantByCPF({ cpf }: { cpf: string }) {
    const reference = `visitant-${cpf}`;
    try {
      if (!visitantInMemory.hasItem(reference)) {
        const visitant = await this.prisma.visitant.findUnique({
          where: {
            cpf,
          },
          select: this.selectScope,
        });

        visitantInMemory.storePermanentItem(reference, visitant);
      }
      return visitantInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw error;
    }
  }

  async getVisitants({
    page = 1,
    name,
    cpf,
    allowed,
    blocked,
    pending,
    processing,
  }: {
    page: number;
    name?: string;
    cpf?: string;
    blocked?: string;
    allowed?: string;
    processing?: string;
    pending?: string;
  }) {
    const reference = `visitants-${page}-${name}-${cpf}-${allowed}-${blocked}-${pending}-${processing}`;

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
    };

    const visitantsCount = await this.prisma.visitant.count({
      where,
    });

    const perPage =
      process.env.NODE_ENV === 'development'
        ? 2
        : Number(process.env.DEFAULT_PER_PAGE);

    const totalPages = Math.ceil(visitantsCount / perPage);

    try {
      if (!visitantInMemory.hasItem(reference)) {
        const visitant = await this.prisma.visitant.findMany({
          select: this.selectScope,
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        });
        visitantsInMemory.storePermanentItem(reference, visitant);
      }

      return {
        resource: visitantsInMemory.retrieveItemValue(reference),
        totalPages,
      };
    } catch (error) {
      throw error;
    }
  }

  async getVisitant({ id }: { id: string }) {
    const reference = `visitant-${id}`;
    try {
      if (!visitantInMemory.hasItem(reference)) {
        const visitant = await this.prisma.visitant.findUnique({
          where: {
            id,
          },
          select: this.selectScope,
        });
        visitantInMemory.storePermanentItem(reference, visitant);
      }
      return visitantInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw error;
    }
  }

  async updateVisitant({
    id,
    data,
  }: {
    id: string;
    data: Prisma.VisitantUpdateInput;
  }) {
    try {
      const [visitant] = await Promise.all([
        this.prisma.visitant.findUniqueOrThrow({
          where: {
            id,
          },
          select: {
            photo: true,
            documentUrl: true,
          },
        }),
        this.prisma.visitant.update({
          where: {
            id,
          },
          data: { ...data, updatedAt: timeStampISOTime },
        }),
      ]);

      if (data.photo && visitant.photo)
        await deleteImageByUrl({
          imageUrl: visitant.photo,
          location: 'Avatar',
          resource: 'Visitants',
        });
      if (data.documentUrl && visitant.documentUrl)
        await deleteImageByUrl({
          imageUrl: visitant.documentUrl,
          location: 'Documents',
          resource: 'Visitants',
        });
      return this.resetCache();
    } catch (error) {
      throw error;
    }
  }

  async confirmationVisitant({
    id,
    data,
  }: {
    id: string;
    data: Prisma.VisitantUpdateInput;
  }) {
    try {
      const visitant = await this.prisma.visitant.update({
        where: {
          id,
        },
        select: {
          available: {
            select: {
              id: true,
              justifications: {
                select: {
                  justification: {
                    select: {
                      description: true,
                    },
                  },
                },
              },
            },
          },
        },
        data: { ...data, updatedAt: timeStampISOTime },
      });

      if (
        !visitant.available.justifications.some(
          (just) =>
            just.justification.description ===
            'Confirmação com a administração',
        )
      )
        await this.prisma.availablesJustifications.create({
          data: {
            availabe: {
              connect: {
                id: visitant.available.id,
              },
            },
            justification: {
              connect: {
                description: 'Confirmação com a administração',
              },
            },
          },
        });

      return this.resetCache();
    } catch (error) {
      throw error;
    }
  }

  async blockVisitant({
    id,
    justifications,
    role,
  }: {
    id: string;
    justifications: Array<string>;
    role: ROLE;
  }) {
    try {
      const [visitant, justificationByAdmin] = await Promise.all([
        this.prisma.visitant.findUniqueOrThrow({
          where: {
            id,
          },
          select: {
            available: {
              select: {
                id: true,
              },
            },
          },
        }),
        this.prisma.justification.findFirstOrThrow({
          where: {
            description: 'Bloqueado pela administração',
          },
        }),
      ]);

      if (role === 'ADMIN' || role === 'ROOT')
        justifications.push(justificationByAdmin.id);
      await this.prisma.available.update({
        where: {
          id: visitant.available.id,
        },
        data: {
          status: 'BLOCKED',
          updatedAt: timeStampISOTime,
          justifications: {
            createMany: {
              skipDuplicates: true,
              data: justifications.map((just) => ({ justificationId: just })),
            },
          },
        },
      });

      return this.resetCache();
    } catch (error) {
      throw error;
    }
  }

  async rejectVisitant({
    id,
    justifications,
  }: {
    id: string;
    justifications: Array<string>;
  }) {
    try {
      const visitant = await this.prisma.visitant.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          available: {
            select: {
              id: true,
            },
          },
        },
      });
      await this.prisma.available.update({
        where: {
          id: visitant.available.id,
        },
        data: {
          justifications: {
            deleteMany: {
              availableId: visitant.available.id,
            },
            createMany: {
              skipDuplicates: true,
              data: justifications.map((just) => ({ justificationId: just })),
            },
          },
        },
      });

      return this.resetCache();
    } catch (error) {
      throw error;
    }
  }

  async allowVisitant({ id, role }: { id: string; role: ROLE }) {
    try {
      if (role !== 'ADMIN' && role !== 'ROOT') {
        const visitant = await this.prisma.visitant.findUnique({
          where: {
            id,
            available: {
              justifications: {
                some: {
                  justification: {
                    description: 'Bloqueado pela administração',
                  },
                },
              },
            },
          },
        });
        if (Boolean(visitant))
          throw new HttpException(
            `Informamos que ${visitant.name.split(' ')[0]} foi bloqueado pela administração. Somente a administração pode desbloquea-lo(a).`,
            HttpStatus.FORBIDDEN,
          );
      }

      await this.prisma.visitant.update({
        where: {
          id,
        },
        data: {
          available: {
            update: {
              status: 'ALLOWED',
              updatedAt: timeStampISOTime,
              justifications: {
                deleteMany: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      return this.resetCache();
    } catch (error) {
      throw error;
    }
  }

  async deleteVisitant({ id }: { id: string }) {
    try {
      const visitant = await this.prisma.visitant.delete({
        where: {
          id,
        },
      });

      if (visitant.documentUrl)
        await deleteImageByUrl({
          imageUrl: visitant.documentUrl,
          location: 'Documents',
          resource: 'Visitants',
        });

      if (visitant.photo)
        await deleteImageByUrl({
          imageUrl: visitant.photo,
          location: 'Avatar',
          resource: 'Visitants',
        });

      return this.resetCache();
    } catch (error) {
      throw error;
    }
  }
}
