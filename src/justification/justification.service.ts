import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JustificationService {
  constructor(private prismaService: PrismaService) {}

  async list() {
    try {
      return await this.prismaService.justification.findMany();
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const fieldTartget = error.meta?.target;
        throw new ConflictException(fieldTartget[0]);
      }

      throw new InternalServerErrorException('An unexpected error occurred.');
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const fieldTartget = error.meta?.target;
        throw new ConflictException(fieldTartget[0]);
      }

      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }
}
