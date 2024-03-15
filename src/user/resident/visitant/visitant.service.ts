import { Injectable } from '@nestjs/common';
import { residentVisitantsInMemory } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResidentVisitantService {
  private readonly selectScope = {
    resident: {
      select: {
        visitants: {
          select: {
            available: true,
            cnh: true,
            name: true,
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
}
