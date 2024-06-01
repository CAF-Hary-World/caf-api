import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ownerInMemory, ownersInMemory } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetUsers } from 'src/utils/resetCache';

@Injectable()
export class OwnerService {
  private resetCache = resetUsers;

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

      throw error;
    }
  }

  async getOwner({ id, ownerId }: { id: string; ownerId: string }) {
    const reference = `user-${id}-owner-${ownerId}`;

    try {
      if (!ownerInMemory.hasItem(reference)) {
        const owner = await this.prisma.user.findUniqueOrThrow({
          where: { id, ownerId },
          select: this.selectScope,
        });

        ownerInMemory.storeExpiringItem(
          reference,
          owner,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return ownerInMemory.retrieveItemValue(reference);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createOwner(data: Prisma.UserCreateInput & Prisma.OwnerCreateInput) {
    const {
      owner,
      user,
    }: { owner: Prisma.OwnerCreateInput; user: Prisma.UserCreateInput } = {
      owner: data,
      user: data,
    };
    this.resetCache();
    try {
      await this.prisma.user.create({
        data: {
          name: user.name,
          role: { connect: { name: 'OWNER' } },
          owner: {
            create: {
              ...owner,
            },
          },
        },
      });
    } catch (error) {
      console.log('Owner List Service =', error);

      throw error;
    }
  }

  async updateOwner({
    data,
    id,
    ownerId,
  }: {
    data: Prisma.UserUpdateInput & Prisma.OwnerUpdateInput;
    id: string;
    ownerId: string;
  }) {
    this.resetCache();
    const {
      owner,
      user,
    }: { owner: Prisma.OwnerUpdateInput; user: Prisma.UserUpdateInput } = {
      owner: data,
      user: data,
    };

    try {
      const userUnique = await this.prisma.user.findUniqueOrThrow({
        where: {
          id,
          ownerId,
        },
        include: {
          owner: true,
        },
      });

      await this.prisma.user.update({
        where: {
          id,
          ownerId,
        },
        data: {
          ...(user.name !== userUnique.name && { name: user.name }),
          owner: {
            update: {
              ...(owner.cpf !== userUnique.owner.cpf && { cpf: owner.cpf }),
              ...(owner.email !== userUnique.owner.email && {
                email: owner.email,
              }),
              ...(owner.house !== userUnique.owner.house && {
                house: owner.house,
              }),
              ...(owner.square !== userUnique.owner.square && {
                square: owner.square,
              }),
              ...(owner.phone !== userUnique.owner.phone && {
                phone: owner.phone,
              }),
              ...(owner.photo !== userUnique.owner.photo && {
                photo: owner.photo,
              }),
              ...(owner.password !== userUnique.owner.password && {
                password: owner.password,
              }),
            },
          },
        },
      });
    } catch (error) {
      console.log('Owner List Service =', error);
      throw error;
    }
  }

  async deleteOwner({ id, ownerId }: { id: string; ownerId: string }) {
    this.resetCache();

    try {
      await this.prisma.user.delete({
        where: {
          id,
          ownerId,
        },
      });
    } catch (error) {
      console.log('Owner List Service =', error);

      throw error;
    }
  }

  async deleteManyOwners(identifiers: Array<{ id: string; ownerId: string }>) {
    this.resetCache();

    try {
      return await this.prisma.user.deleteMany({
        where: {
          id: {
            in: identifiers.map((identifier) => identifier.id),
          },
          ownerId: {
            in: identifiers.map((identifier) => identifier.ownerId),
          },
        },
      });
    } catch (error) {
      console.log('Owner List Service =', error);

      throw error;
    }
  }
}
