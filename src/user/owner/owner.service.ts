import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ownerInMemory, ownersInMemory } from 'src/libs/memory-cache';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { selectOwnerScope } from 'src/scopes/visitant';
import { resetUsers } from 'src/utils/resetCache';
import { timeStampISOTime } from 'src/utils/time';
import { translate } from 'src/utils/translate';

@Injectable()
export class OwnerService {
  private resetCache = resetUsers;
  private readonly selectScope = selectOwnerScope;

  constructor(
    private readonly prisma: PrismaService,
    private mailService: MailService,
  ) {}

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

    const perPage =
      process.env.NODE_ENV === 'development'
        ? 2
        : Number(process.env.DEFAULT_PER_PAGE);

    const ownersCount = await this.prisma.user.count({
      where: {
        role: {
          name: 'OWNER',
        },
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
        ...(cpf && { owner: { cpf: { contains: cpf } } }),
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
            ...(name && { name: { contains: name, mode: 'insensitive' } }),
            ...(cpf && { owner: { cpf: { contains: cpf } } }),
          },
          orderBy: { createdAt: 'desc' },
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
      console.error('Owner List Service =', error);
      // Handle specific Prisma errors or throw a general internal server error
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(error.meta?.target);
      }

      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async getOwner({ id, ownerId }: { id: string; ownerId: string }) {
    const reference = `user-${id}-owner`;

    try {
      if (!ownerInMemory.hasItem(reference)) {
        const owner = await this.prisma.user.findUniqueOrThrow({
          where: { id, owner: { id: ownerId } },
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
      console.error(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(error.meta?.target);
      }

      throw new InternalServerErrorException('An unexpected error occurred.');
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
    try {
      const userCreated = await this.prisma.user.create({
        data: {
          name: user.name,
          role: { connect: { name: 'OWNER' } },
          available: {
            create: {
              status: 'PROCESSING',
              justifications: {
                create: {
                  justification: {
                    connect: {
                      description: 'Aguardando convite da administração',
                    },
                  },
                },
              },
            },
          },
          owner: {
            create: {
              cpf: owner.cpf,
              email: owner.email,
              password: owner.password,
              phone: owner.phone,
              house: owner.house,
              square: owner.square,
            },
          },
        },
        select: {
          id: true,
          name: true,
          owner: {
            select: {
              id: true,
              email: true,
            },
          },
          available: {
            select: {
              id: true,
              justifications: {
                select: {
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

      await this.mailService.sendInviteUser({
        id: userCreated.id,
        name: userCreated.name,
        owner: {
          email: userCreated.owner.email,
          id: userCreated.owner.id,
        },
      });

      await this.prisma.availablesJustifications.update({
        where: {
          availableId_justificationId: {
            availableId: userCreated.available.id,
            justificationId: userCreated.available.justifications.find(
              (just) =>
                just.justification.description ===
                'Aguardando convite da administração',
            ).justification.id,
          },
        },
        data: {
          justification: {
            connect: {
              description: 'Aguardando confirmação do email',
            },
          },
          updatedAt: timeStampISOTime,
        },
      });
      this.resetCache();
    } catch (error) {
      console.error('Owner Create Service =', error);

      // Handle specific Prisma errors or throw a general internal server error
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Unique constraint failed
          const failedField = error.meta?.target as Array<string>;
          throw new ConflictException(
            `O ${failedField.includes('house') ? 'Quadra e Casa' : translate(String(failedField))} já foi utilizado!`,
          );
        }
      }

      throw new InternalServerErrorException('An unexpected error occurred.');
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
          owner: {
            id: ownerId,
          },
        },
        include: {
          owner: true,
        },
      });

      await this.prisma.user.update({
        where: {
          id,
          owner: {
            id: ownerId,
          },
        },
        data: {
          ...(user.name !== userUnique.name && {
            name: user.name,
            updatedAt: timeStampISOTime,
          }),
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
              updatedAt: timeStampISOTime,
            },
          },
        },
      });
    } catch (error) {
      console.error('Owner UPDATE Service =', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const failedField = error.meta?.target as Array<string>;
          throw new ConflictException(
            `O ${failedField.includes('house') ? 'Quadra e Casa' : failedField} já foi utilizado!`,
          );
        }
      }

      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async deleteOwner({ id, ownerId }: { id: string; ownerId: string }) {
    this.resetCache();

    try {
      await this.prisma.user.delete({
        where: {
          id,
          owner: {
            id: ownerId,
          },
        },
      });
    } catch (error) {
      console.error('Owner DELETE Service =', error);
      // Handle specific Prisma errors or throw a general internal server error
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(error.meta?.target);
      }

      throw new InternalServerErrorException('An unexpected error occurred.');
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
      console.error('Owner List Service =', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(error.meta?.target);
      }

      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async sendInvite({ id, ownerId }: { id: string; ownerId: string }) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          id,
          owner: {
            id: ownerId,
          },
        },
        select: {
          id: true,
          name: true,
          owner: {
            select: {
              id: true,
              email: true,
            },
          },
          available: {
            select: {
              id: true,
              justifications: {
                select: {
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

      await this.mailService.sendInviteUser({
        id: user.id,
        name: user.name,
        owner: {
          email: user.owner.email,
          id: user.owner.id,
        },
      });

      await this.prisma.availablesJustifications.update({
        where: {
          availableId_justificationId: {
            availableId: user.available.id,
            justificationId: user.available.justifications.find(
              (just) =>
                just.justification.description ===
                'Aguardando convite da administração',
            ).justification.id,
          },
        },
        data: {
          justification: {
            connect: {
              description: 'Aguardando confirmação do email',
            },
          },
          updatedAt: timeStampISOTime,
        },
      });

      resetUsers();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(error.meta?.target);
      }

      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async blockOnwer({
    id,
    ownerId,
    justifications,
  }: {
    id: string;
    ownerId: string;
    justifications: Array<string>;
  }) {
    try {
      const userOwner = await this.prisma.user.findUniqueOrThrow({
        where: {
          id,
          owner: {
            id: ownerId,
          },
        },
        select: {
          id: true,
          available: {
            select: {
              id: true,
            },
          },
        },
      });
      this.resetCache();

      return await this.prisma.available.update({
        where: {
          id: userOwner.available.id,
        },
        data: {
          status: 'BLOCKED',
          updatedAt: timeStampISOTime,
          justifications: {
            createMany: {
              skipDuplicates: true,
              data: justifications.map((just) => ({ justificationId: just })),
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(error.meta?.target);
      }

      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async allowOnwer({ id, ownerId }: { id: string; ownerId: string }) {
    try {
      const userOwner = await this.prisma.user.findUniqueOrThrow({
        where: {
          id,
          owner: {
            id: ownerId,
          },
        },
        select: {
          id: true,
          available: {
            select: {
              id: true,
            },
          },
        },
      });
      this.resetCache();

      return await this.prisma.available.update({
        where: {
          id: userOwner.available.id,
        },
        data: {
          status: 'ALLOWED',
          updatedAt: timeStampISOTime,
          justifications: {
            deleteMany: {
              availableId: userOwner.available.id,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new ConflictException(error.meta?.target);
      }

      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }
}
