import { Injectable } from '@nestjs/common';
import { visitantInMemory } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VisitantService {
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
  constructor(private readonly prisma: PrismaService) {}

  async getVisitantByCPF({ cpf }: { cpf: string }) {
    console.log('getVisitantByCPF = ', cpf);

    const reference = `visitant-${cpf}`;
    try {
      console.log(
        await this.prisma.visitant.findUniqueOrThrow({
          where: {
            cpf,
          },
          select: this.selectScope,
        }),
      );

      if (!visitantInMemory.hasItem(reference)) {
        visitantInMemory.storeExpiringItem(
          reference,
          await this.prisma.visitant.findUniqueOrThrow({
            where: {
              cpf,
            },
            select: this.selectScope,
          }),
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return visitantInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw new Error(error);
    }
  }
}
