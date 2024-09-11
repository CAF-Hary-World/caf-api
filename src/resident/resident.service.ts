import { Injectable } from '@nestjs/common';
import { selectResident } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResidentService {
  constructor(private readonly prisma: PrismaService) {}

  async getResident({ id, residentId }: { id: string; residentId: string }) {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: {
          id,
          resident: {
            id: residentId,
          },
        },
        ...selectResident,
      });
    } catch (error) {
      throw error;
    }
  }
}
