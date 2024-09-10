import {
  residentInMemory,
  residentsInMemory,
  selectResident,
} from '../../../libs/memory-cache';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { encodeSha256 } from 'src/libs/bcrypt';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetUsers } from 'src/utils/resetCache';
import { timeStampISOTime } from 'src/utils/time';

@Injectable()
export class OwnerResidentService {
  private resetCache = resetUsers;

  constructor(
    private readonly prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async listResidents({
    id,
    ownerId,
    page = 1,
    name,
    cpf,
  }: {
    id: string;
    ownerId: string;
    page: number;
    name?: string;
    cpf?: string;
  }) {
    const reference = `user${id}-owner-${ownerId}-resident-${page}-${name}-${cpf}`;

    const perPage =
      process.env.NODE_ENV === 'development'
        ? 2
        : Number(process.env.DEFAULT_PER_PAGE);

    const residentsCount = await this.prisma.user.count({
      where: {
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
        ...(cpf && { resident: { cpf: { contains: cpf } } }),
        ...(ownerId && {
          resident: {
            owner: {
              id: ownerId,
            },
          },
        }),
      },
    });

    const totalPages = Math.ceil(residentsCount / perPage);

    try {
      if (!residentsInMemory.hasItem(reference)) {
        const residents = await this.prisma.user.findMany({
          where: {
            ...(name && { name: { contains: name, mode: 'insensitive' } }),
            ...(cpf && { resident: { cpf: { contains: cpf } } }),
            ...(ownerId && {
              resident: {
                owner: {
                  id: ownerId,
                },
              },
            }),
          },
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

  async createResident({
    resident,
    ownerId,
  }: {
    resident: Prisma.UserCreateInput & Prisma.ResidentCreateInput;
    ownerId: string;
  }) {
    let residentId: string;

    try {
      const residentCreated = await this.prisma.user.create({
        data: {
          name: resident.name,
          available: {
            create: {
              status: 'PROCESSING',
              justifications: {
                create: {
                  justification: {
                    connect: {
                      description: 'Aguardando confirmação do email',
                    },
                  },
                },
              },
            },
          },
          role: {
            connect: {
              name: 'RESIDENT',
            },
          },
          resident: {
            create: {
              password: encodeSha256(resident.cpf),
              cpf: resident.cpf,
              phone: resident.phone,
              owner: {
                connect: {
                  id: ownerId,
                },
              },
            },
          },
        },
        ...selectResident,
      });
      residentInMemory.storeExpiringItem(
        `user-${residentCreated.id}-resident`,
        residentCreated,
        process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
      );
      residentId = residentCreated.id;
      await this.mailService.sendResidentConfirmation({
        recipient: {
          email: resident.email,
          name: resident.name,
          id: residentCreated.id,
        },
        sender: {
          name: residentCreated.name,
        },
      });
      this.resetCache();
      residentInMemory.storeExpiringItem(
        `user-${residentCreated.id}-resident`,
        residentCreated,
        process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
      );
      return residentCreated;
    } catch (error) {
      console.error('Residente Create Service = ', error);
      await this.prisma.user.delete({
        where: { id: residentId },
      });
      throw error;
    }
  }

  async removeResident({
    cpf,
    id,
    ownerId,
  }: {
    id: string;
    ownerId: string;
    cpf: string;
  }) {
    this.resetCache();
    try {
      await this.prisma.user.delete({
        where: {
          id,
          resident: {
            cpf,
            owner: {
              id: ownerId,
            },
          },
        },
      });
      return this.resetCache();
    } catch (error) {
      console.error('Residente Create Service = ', error);

      throw error;
    }
  }

  async updateResident({
    id,
    residentId,
    ownerId,
    user,
  }: {
    id: string;
    residentId: string;
    ownerId: string;
    user: Prisma.UserUpdateInput & { resident: Prisma.ResidentUpdateInput };
  }) {
    this.resetCache();

    try {
      await this.prisma.user.update({
        where: {
          id,
          resident: {
            id: residentId,
            owner: {
              id: ownerId,
            },
          },
        },
        data: {
          name: user.name,
          updatedAt: timeStampISOTime,
          resident: {
            update: {
              ...(user.resident.cpf && { cpf: user.resident.cpf }),
              ...(user.resident.email && { email: user.resident.email }),
              ...(user.resident.phone && { phone: user.resident.phone }),
              ...(user.resident.password && {
                phone: encodeSha256(String(user.resident.password)),
              }),
              updatedAt: timeStampISOTime,
            },
          },
        },
      });
      return this.resetCache();
    } catch (error) {
      console.error('Residente Update Service = ', error);

      throw error;
    }
  }
}
