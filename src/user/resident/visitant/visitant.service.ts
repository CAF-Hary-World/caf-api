import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  residentInMemory,
  residentVisitantInMemory,
  residentVisitantsInMemory,
  residentsInMemory,
  userInMemory,
  usersInMemory,
} from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResidentVisitantService {
  private readonly selectScope = {
    resident: {
      select: {
        visitants: {
          select: {
            available: true,
            name: true,
            cnh: true,
            code: true,
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
  };

  constructor(private readonly prisma: PrismaService) {}

  async listVisitants({ id, residentId }: { id: string; residentId: string }) {
    const reference = JSON.stringify(this.selectScope) + '-resident-visitant';
    try {
      if (!residentVisitantsInMemory.hasItem(reference)) {
        residentVisitantsInMemory.storeExpiringItem(
          reference,
          await this.prisma.user.findMany({
            where: {
              id,
              resident: { id: residentId },
            },
            select: this.selectScope,
          }),
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return residentVisitantsInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw new Error(error);
    }
  }

  async createVisitant({
    visitant,
  }: {
    visitant: Prisma.VisitantCreateInput & { invitedBy: string };
  }) {
    userInMemory.clear();
    usersInMemory.clear();
    residentInMemory.clear();
    residentsInMemory.clear();
    residentVisitantInMemory.clear();
    residentVisitantsInMemory.clear();

    try {
      return await this.prisma.visitant.create({
        data: {
          cpf: visitant.cpf,
          kind: visitant.kind,
          name: visitant.name,
          phone: visitant.phone,
          resident: {
            connect: { id: visitant.invitedBy },
          },
          available: {
            create: {
              status: 'PROCESSING',
            },
          },
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }
}
