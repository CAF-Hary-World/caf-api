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
}
