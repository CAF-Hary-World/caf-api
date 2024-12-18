import {
  residentInMemory,
  residentsInMemory,
  selectResident,
} from '../../../libs/memory-cache';
import { Injectable } from '@nestjs/common';
import { Prisma, STATUS } from '@prisma/client';

import { encodeSha256 } from 'src/libs/bcrypt';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { deleteImageByUrl } from 'src/utils/images';
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
    allowed,
    blocked,
    processing,
  }: {
    id: string;
    ownerId: string;
    page: number;
    name?: string;
    cpf?: string;
    blocked?: string;
    allowed?: string;
    processing?: string;
  }) {
    const where: Prisma.UserWhereInput = {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(ownerId && {
        resident: {
          ...(cpf && { cpf: { contains: cpf } }),
          owner: {
            id: ownerId,
          },
        },
      }),
      ...(allowed && { available: { status: 'ALLOWED' } }),
      ...(blocked && { available: { status: 'BLOCKED' } }),
      ...(processing && { available: { status: 'PROCESSING' } }),
    };

    const reference = `user${id}-owner-${ownerId}-resident-${page}-${name}-${cpf}-${allowed}-${blocked}-${processing}`;

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
              email: resident.email,
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
    residentId,
    id,
    userResidentId,
    ownerId,
  }: {
    id: string;
    ownerId: string;
    userResidentId: string;
    residentId: string;
  }) {
    try {
      const user = await this.prisma.user.delete({
        where: {
          id: userResidentId,
          resident: {
            id: residentId,
            owner: {
              id: ownerId,
              user: {
                id,
              },
            },
          },
        },
        select: {
          resident: {
            select: {
              photo: true,
            },
          },
        },
      });

      if (user.resident.photo)
        await deleteImageByUrl({
          imageUrl: user.resident.photo,
          location: 'Avatar',
          resource: 'Residents',
        });

      return this.resetCache();
    } catch (error) {
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
      const [userResident] = await Promise.all([
        this.prisma.user.findUnique({
          where: {
            id,
          },
          select: {
            resident: {
              select: {
                photo: true,
              },
            },
          },
        }),
        this.prisma.user.update({
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
        }),
      ]);

      if (user.resident.photo && userResident.resident.photo)
        await deleteImageByUrl({
          imageUrl: userResident.resident.photo,
          location: 'Avatar',
          resource: 'Residents',
        });

      return this.resetCache();
    } catch (error) {
      console.error('Residente Update Service = ', error);

      throw error;
    }
  }

  async updateAvailableStatus({
    residentId,
    userResidentId,
    justifications,
    status,
  }: {
    userOwnerId: string;
    userResidentId: string;
    residentId: string;
    justifications: Array<string>;
    status: STATUS;
  }) {
    try {
      const blockedByAdmin = await this.prisma.available.findUnique({
        where: {
          userId: userResidentId,
          user: {
            id: userResidentId,
            resident: {
              id: residentId,
            },
          },
          justifications: {
            some: {
              justification: {
                description: 'Bloqueado pela administração',
              },
            },
          },
        },
      });

      if (Boolean(blockedByAdmin))
        throw new Error('Morador bloqueado pela administração');

      await this.prisma.available.update({
        where: {
          userId: userResidentId,
          user: {
            id: userResidentId,
            resident: {
              id: residentId,
            },
          },
        },
        data: {
          justifications: {
            createMany: {
              skipDuplicates: true,
              data: justifications.map((just) => ({ justificationId: just })),
            },
          },
          status,
          updatedAt: timeStampISOTime,
        },
      });
      this.resetCache();
    } catch (error) {
      console.error('Resident Update availabe Service = ', error);

      throw error;
    }
  }

  async allowResident({
    ownerId,
    residentId,
    userOwnerId,
    userResidentId,
  }: {
    userOwnerId: string;
    ownerId: string;
    userResidentId: string;
    residentId: string;
  }) {
    try {
      const available = await this.prisma.available.findUniqueOrThrow({
        where: {
          userId: userResidentId,
        },
      });

      await this.prisma.available.update({
        where: {
          userId: userResidentId,
          user: {
            id: userResidentId,
            resident: {
              id: residentId,
              owner: {
                id: ownerId,
                user: {
                  id: userOwnerId,
                },
              },
            },
          },
        },
        data: {
          status: 'ALLOWED',
          updatedAt: timeStampISOTime,
          justifications: {
            deleteMany: {
              availableId: available.id,
            },
          },
        },
      });

      return this.resetCache();
    } catch (error) {
      throw error;
    }
  }

  async sendInvite({ id, residentId }: { id: string; residentId: string }) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          id,
          resident: {
            id: residentId,
          },
        },
        select: {
          id: true,
          name: true,
          resident: {
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

      await Promise.all([
        this.mailService.sendInviteUser({
          id: user.id,
          name: user.name,
          resident: {
            email: user.resident.email,
            id: user.resident.id,
          },
        }),
        this.prisma.availablesJustifications.update({
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
        }),
      ]);

      resetUsers();
    } catch (error) {
      throw error;
    }
  }
}
