import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResidentService {
  constructor(private readonly prisma: PrismaService) {}

  async belongsToOwner(id: string) {
    try {
      await this.prisma.user.findFirstOrThrow({ where: { id } });
      await this.prisma.resident.findFirstOrThrow({
        where: {
          userId: id,
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }
}
