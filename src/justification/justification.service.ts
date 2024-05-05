import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JustificationService {
  constructor(private prismaService: PrismaService) {}

  async list() {
    try {
      return await this.prismaService.justification.findMany();
    } catch (error) {
      throw new Error(error);
    }
  }
}
