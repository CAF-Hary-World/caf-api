import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JustificationService {
  constructor(private prismaService: PrismaService) {}

  async list() {
    try {
      return await this.prismaService.justification.findMany({
        where: {
          description: {
            notIn: [
              'Aguardando confirmação do email',
              'Aguardando convite da administração',
              'Bloqueado pela administração',
            ],
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async create({ description }: { description: string }) {
    try {
      return await this.prismaService.justification.create({
        data: {
          description,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async delete({ id }: { id: string }) {
    try {
      return await this.prismaService.justification.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
