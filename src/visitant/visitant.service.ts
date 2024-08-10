import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { visitantInMemory, visitantsInMemory } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetUsers } from 'src/utils/resetCache';

@Injectable()
export class VisitantService {
  private readonly selectScope = {
    available: {
      select: {
        status: true,
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

  private resetCache = resetUsers;

  constructor(private readonly prisma: PrismaService) {}

  async getVisitantByCPF({ cpf }: { cpf: string }) {
    const reference = `visitant-${cpf}`;
    try {
      if (!visitantInMemory.hasItem(reference)) {
        console.log('no visitant cpf in cache');
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
  }: {
    page: number;
    name?: string;
    cpf?: string;
  }) {
    const reference = `visitants-${page}-${name}-${cpf}`;

    const visitantsCount = await this.prisma.user.count({
      where: {
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
        ...(cpf && { cpf: { contains: cpf } }),
      },
    });

    const perPage = process.env.DEFAULT_PER_PAGE
      ? Number(process.env.DEFAULT_PER_PAGE)
      : 10;

    const totalPages = Math.ceil(visitantsCount / perPage);

    try {
      if (!visitantInMemory.hasItem(reference)) {
        console.log('no visitant cpf in cache');
        const visitant = await this.prisma.visitant.findMany({
          select: this.selectScope,
          where: {
            ...(name && { name: { contains: name, mode: 'insensitive' } }),
            ...(cpf && { cpf: { contains: cpf } }),
          },
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
        console.log('no visitant id in cache');
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
      this.resetCache();
      await this.prisma.visitant.update({
        where: {
          id,
        },
        data,
      });
      this.resetCache();
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
      this.resetCache();
      const visitant = await this.prisma.visitant.update({
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
        data,
      });

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

      this.resetCache();
    } catch (error) {
      throw error;
    }
  }
}
