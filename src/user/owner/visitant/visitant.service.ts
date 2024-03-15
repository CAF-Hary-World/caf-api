import { Injectable } from '@nestjs/common';
import { ownerVisitantsInMemory } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnerVisitantService {
  private readonly selectScope = {
    owner: {
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

  async listVisitants({ id, ownerId }: { id: string; ownerId: string }) {
    const reference = JSON.stringify(this.selectScope) + '-owner-visitant';
    try {
      if (!ownerVisitantsInMemory.hasItem(reference)) {
        ownerVisitantsInMemory.storeExpiringItem(
          reference,
          await this.prisma.user.findMany({
            where: {
              id,
              owner: { id: ownerId },
            },
            select: this.selectScope,
          }),
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return ownerVisitantsInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw new Error(error);
    }
  }
}
