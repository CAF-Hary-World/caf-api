import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { encodeSha256 } from 'src/libs/bcrypt';
import { residentsInMemory, selectResident } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetUsers } from 'src/utils/resetCache';
import { timeStampISOTime } from 'src/utils/time';

@Injectable()
export class ResidentService {
  private resetCache = resetUsers;

  constructor(private readonly prisma: PrismaService) {}

  async listResidents({
    page = 1,
    name,
    cpf,
    allowed,
    blocked,
    processing,
  }: {
    page: number;
    name?: string;
    cpf?: string;
    blocked?: string;
    allowed?: string;
    processing?: string;
  }) {
    const where: Prisma.UserWhereInput = {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(cpf && { cpf: { contains: cpf } }),
      ...(allowed && { available: { status: 'ALLOWED' } }),
      ...(blocked && { available: { status: 'BLOCKED' } }),
      ...(processing && { available: { status: 'PROCESSING' } }),
    };

    const reference = `user-resident-${page}-${name}-${cpf}-${allowed}-${blocked}-${processing}`;

    const perPage =
      process.env.NODE_ENV === 'development'
        ? 2
        : Number(process.env.DEFAULT_PER_PAGE);

    const residentsCount = await this.prisma.user.count({
      where,
    });

    const totalPages = Math.ceil(residentsCount / perPage);

    try {
      if (!residentsInMemory.hasItem(reference)) {
        const residents = await this.prisma.user.findMany({
          where,
          orderBy: { name: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
          ...selectResident,
        });

        residentsInMemory.storeExpiringItem(
          reference,
          residents,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return {
        resource: residentsInMemory.retrieveItemValue(reference),
        totalPages,
      };
    } catch (error) {
      console.error('Residente List Service =', error);

      throw error;
    }
  }

  async belongsToOwner(id: string) {
    try {
      await this.prisma.user.findFirstOrThrow({ where: { id } });
      await this.prisma.resident.findFirstOrThrow({
        where: {
          userId: id,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async confirmation({ id, password }: { id: string; password: string }) {
    this.resetCache();
    try {
      const user = await this.prisma.user.findFirstOrThrow({
        where: { id },
        include: { available: true },
      });
      console.log(user);

      if (user.available.status === 'ALLOWED')
        throw new Error('User already available');
      return await this.prisma.user.update({
        where: { id },
        data: {
          available: {
            update: {
              status: 'ALLOWED',
              updatedAt: timeStampISOTime,
              justifications: {
                deleteMany: {
                  availableId: user.available.id,
                },
              },
            },
          },
          resident: {
            update: {
              password: encodeSha256(password),
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
