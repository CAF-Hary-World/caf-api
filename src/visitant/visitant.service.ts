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
    const reference = `visitant-${cpf}`;
    try {
      if (!visitantInMemory.hasItem(reference)) {
        const visitant = await this.prisma.visitant.findUnique({
          where: {
            cpf,
          },
          select: this.selectScope,
        });
        console.log('visitant = ', visitant);
        console.log(`not-in-cache-visitant-${cpf}`);
        visitantInMemory.storePermanentItem(reference, visitant);
      }
      console.log(visitantInMemory.retrieveItemValue(reference));
      return visitantInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw new Error(error);
    }
  }
}
