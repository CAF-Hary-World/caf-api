import { Injectable } from '@nestjs/common';
import {
  ownerInMemory,
  ownersInMemory,
  residentInMemory,
  residentsInMemory,
  userInMemory,
  usersInMemory,
  visitantInMemory,
  visitantsInMemory,
} from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnerService {
  private resetCache() {
    userInMemory.clear();
    usersInMemory.clear();
    ownerInMemory.clear();
    ownersInMemory.clear();
    visitantInMemory.clear();
    visitantsInMemory.clear();
    residentsInMemory.clear();
    residentInMemory.clear();
  }

  private readonly selectScope = {
    name: true,
    available: { include: { justifications: true } },
    id: true,
    role: { select: { name: true, id: true } },
    owner: {
      select: {
        email: true,
        id: true,
        phone: true,
        photo: true,
        cpf: true,
        house: true,
        square: true,
        residents: {
          select: {
            email: true,
            id: true,
            phone: true,
            cpf: true,
            photo: true,
          },
        },
      },
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async listOwners({
    page = 1,
    name,
    cpf,
  }: {
    page: number;
    name?: string;
    cpf?: string;
  }) {
    const reference = `user-owner-${page}-${name}-${cpf}`;

    const perPage = process.env.DEFAULT_PER_PAGE
      ? Number(process.env.DEFAULT_PER_PAGE)
      : 10;

    const ownersCount = await this.prisma.user.count({
      where: {
        role: {
          name: 'OWNER',
        },
        ...(name && { name: { contains: name } }),
        ...(cpf && { cpf: { contains: cpf } }),
      },
    });

    const totalPages = Math.ceil(ownersCount / perPage);

    try {
      if (!ownersInMemory.hasItem(reference)) {
        const owners = await this.prisma.user.findMany({
          where: {
            role: {
              name: 'OWNER',
            },
            ...(name && { name: { contains: name } }),
            ...(cpf && { cpf: { contains: cpf } }),
          },
          orderBy: { name: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
          select: this.selectScope,
        });

        ownersInMemory.storeExpiringItem(
          reference,
          owners,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return {
        resource: ownersInMemory.retrieveItemValue(reference),
        totalPages,
      };
    } catch (error) {
      console.log('Owner List Service =', error);

      throw new Error(error);
    }
  }
}
