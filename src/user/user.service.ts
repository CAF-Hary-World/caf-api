import { selectUser } from './../libs/memory-cache';
import { Injectable } from '@nestjs/common';
import { Prisma, ROLE } from '@prisma/client';
import { usersInMemory } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { timeStampISOTime } from 'src/utils/time';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers({
    name,
    roles,
    house,
    square,
    page,
  }: {
    name?: string;
    house?: string;
    square?: string;
    roles: Array<ROLE>;
    page: number;
  }) {
    const reference = `user-${name}-${roles.join('-')}-${page}-${house}-${square}`;

    const where: Prisma.UserWhereInput = {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(house && {
        OR: [
          {
            owner: {
              house,
            },
          },
          {
            resident: {
              owner: {
                house,
              },
            },
          },
        ],
      }),
      ...(square && {
        OR: [
          {
            owner: {
              square,
            },
          },
          {
            resident: {
              owner: {
                square,
              },
            },
          },
        ],
      }),
      ...(roles.length > 0 && { role: { name: { in: roles } } }),
    };

    const perPage =
      process.env.NODE_ENV === 'development'
        ? 2
        : Number(process.env.DEFAULT_PER_PAGE);

    const usersCount = await this.prisma.user.count({
      where,
    });

    const totalPages = Math.ceil(usersCount / perPage);

    try {
      if (!usersInMemory.hasItem(reference)) {
        const users = await this.prisma.user.findMany({
          where,
          orderBy: { name: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
          ...selectUser,
        });

        usersInMemory.storeExpiringItem(
          reference,
          users,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return {
        resource: usersInMemory.retrieveItemValue(reference),
        totalPages,
      };
    } catch (error) {
      throw error;
    }
  }

  async confirmation(id: string) {
    try {
      const user = await this.prisma.user.findFirstOrThrow({
        where: { id },
        include: {
          available: {
            include: {
              justifications: {
                include: {
                  justification: {
                    select: {
                      id: true,
                      description: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (user.available.status === 'ALLOWED')
        throw new Error('User already available');
      return await this.prisma.user.update({
        where: { id },
        data: {
          available: {
            update: {
              updatedAt: timeStampISOTime,
              justifications: {
                delete: {
                  availableId: user.available.id,
                  availableId_justificationId: {
                    availableId: user.available.id,
                    justificationId: user.available.justifications.find(
                      (justification) => {
                        return (
                          justification.justification.description ===
                          'Aguardando confirmação do email'
                        );
                      },
                    ).justification.id,
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
