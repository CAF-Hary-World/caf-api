import { Injectable } from '@nestjs/common';
import { Prisma, STATUS, Service, User } from '@prisma/client';
import { parcelsInMemory, selectParcel } from 'src/libs/memory-cache';
import { MailService } from 'src/mail/mail.service';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServiceService } from 'src/service/service.service';
import { resetParcel, resetParcels } from 'src/utils/resetCache';

@Injectable()
export class ParcelService {
  constructor(
    private readonly prisma: PrismaService,
    private mailService: MailService,
    private readonly notificationService: NotificationService,
    private readonly serviceService: ServiceService,
  ) {}

  async listParcels({
    page = 1,
    recipient,
    from,
    house,
    square,
    status,
  }: {
    page: number;
    recipient?: string;
    from?: string;
    house?: string;
    square?: string;
    status?: Array<STATUS>;
  }) {
    const reference = `parcels-${page}-${recipient}-${from}-${house}-${square}-${status}`;

    console.log(status);

    const where: Prisma.ParcelWhereInput = {
      ...(recipient && {
        recipient: { name: { contains: recipient, mode: 'insensitive' } },
      }),
      ...(from && {
        service: { name: { contains: from, mode: 'insensitive' } },
      }),
      ...(house && { house }),
      ...(square && { square }),
      ...(status && { status: { in: status } }),
    };

    const perPage =
      process.env.NODE_ENV === 'development'
        ? 2
        : Number(process.env.DEFAULT_PER_PAGE);

    const parcelsCount = await this.prisma.parcel.count({
      where,
    });

    const totalPages = Math.ceil(parcelsCount / perPage);

    try {
      if (!parcelsInMemory.hasItem(reference)) {
        const parcels = await this.prisma.parcel.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
          ...selectParcel,
        });

        parcelsInMemory.storeExpiringItem(
          reference,
          parcels,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }

      return {
        resource: parcelsInMemory.retrieveItemValue(reference),
        totalPages,
      };
    } catch (error) {
      throw error;
    }
  }

  async createParcel(
    data: Prisma.ParcelCreateInput & { serviceName?: string; userId?: string },
  ) {
    try {
      let userExists: User;
      let serviceExists: Service;

      if (data.userId) {
        userExists = await this.prisma.user.findFirst({
          where: {
            id: {
              equals: data.userId,
              mode: 'insensitive',
            },
          },
        });
      }

      if (data.serviceName) {
        serviceExists = await this.prisma.service.findFirst({
          where: {
            name: {
              equals: data.serviceName,
              mode: 'insensitive',
            },
          },
        });
      }

      if (!serviceExists && data.serviceName)
        await this.serviceService.createService({ name: data.serviceName });

      await this.prisma.parcel.create({
        data: {
          house: data.house,
          square: data.square,
          ...(userExists && { recipient: { connect: { id: data.userId } } }),
          ...(data.serviceName && {
            service: { connect: { name: data.serviceName } },
          }),
        },
      });

      await this.prisma.parcel.create({
        data: {
          house: data.house,
          square: data.square,
          ...(userExists && { recipient: { connect: { id: data.userId } } }),
          ...(data.serviceName && {
            service: { connect: { name: data.serviceName } },
          }),
        },
      });

      resetParcels();
      resetParcel();
    } catch (error) {
      throw error;
    }
  }

  async updateParcel({
    data,
    where,
  }: {
    data: Prisma.ParcelUpdateInput;
    where: Prisma.ParcelWhereUniqueInput;
  }) {
    try {
      await this.prisma.parcel.update({
        data,
        where,
      });
      resetParcel();
      resetParcels();
    } catch (error) {
      throw error;
    }
  }

  async retrievedParcel({ id, cpf }: { id: string; cpf: string }) {
    try {
      const [owner, resident, parcel] = await Promise.all([
        this.prisma.owner.findUnique({
          where: {
            cpf,
          },
          select: {
            user: {
              select: {
                id: true,
              },
            },
            house: true,
            square: true,
          },
        }),
        this.prisma.resident.findUnique({
          where: {
            cpf,
          },
          select: {
            user: {
              select: {
                id: true,
              },
            },
            owner: {
              select: {
                house: true,
                square: true,
              },
            },
          },
        }),
        this.prisma.parcel.findUniqueOrThrow({
          where: {
            id,
          },
        }),
      ]);

      const { house, square } = owner || resident.owner;

      const parcelBelongsToUser =
        parcel.house === house && parcel.square === square;

      if (!parcelBelongsToUser)
        throw Error(
          'Endereço de entrega não corresponde ao endereço do morador',
        );

      await this.prisma.parcel.updateMany({
        where: {
          id,
        },
        data: {
          withdrawnById: owner.user.id || resident.user.id,
          status: 'RETRIEVED',
        },
      });
      resetParcels();
      resetParcel();
    } catch (error) {
      throw error;
    }
  }

  async retrievedParcels({ ids, cpf }: { ids: Array<string>; cpf: string }) {
    try {
      const [owner, resident, parcels] = await Promise.all([
        this.prisma.owner.findUnique({
          where: {
            cpf,
          },
          select: {
            user: {
              select: {
                id: true,
              },
            },
            house: true,
            square: true,
          },
        }),
        this.prisma.resident.findUnique({
          where: {
            cpf,
          },
          select: {
            user: {
              select: {
                id: true,
              },
            },
            owner: {
              select: {
                house: true,
                square: true,
              },
            },
          },
        }),
        this.prisma.parcel.findMany({
          where: {
            id: { in: ids },
          },
        }),
      ]);

      const { house, square } = owner || resident.owner;

      const parcelsBelongsToUser = parcels.every(
        (parcel) => parcel.house === house && parcel.square === square,
      );

      if (!parcelsBelongsToUser)
        throw Error(
          'Endereço de entrega não corresponde ao endereço do morador',
        );

      await this.prisma.parcel.updateMany({
        where: {
          id: { in: ids },
        },
        data: {
          withdrawnById: owner.user.id || resident.user.id,
          status: 'RETRIEVED',
        },
      });
      resetParcels();
      resetParcel();
    } catch (error) {
      throw error;
    }
  }

  async deleteParcel({ id }: { id: string }) {
    try {
      await this.prisma.parcel.delete({
        where: {
          id,
        },
      });
      resetParcel();
      resetParcels();
    } catch (error) {
      throw error;
    }
  }

  async deleteManyParcel({ ids }: { ids: Array<string> }) {
    try {
      await this.prisma.parcel.deleteMany({
        where: {
          id: { in: ids },
        },
      });
      resetParcel();
      resetParcels();
    } catch (error) {
      throw error;
    }
  }

  async allowParcel({ id }: { id: string }) {
    try {
      const parcel = await this.prisma.parcel.update({
        where: {
          id,
        },
        data: {
          status: 'ALLOWED',
        },
      });

      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            {
              owner: {
                house: parcel.house,
                square: parcel.square,
              },
            },
            {
              resident: {
                owner: {
                  house: parcel.house,
                  square: parcel.square,
                },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          owner: {
            select: {
              email: true,
            },
          },
          resident: {
            select: {
              email: true,
            },
          },
        },
      });

      const usersFormatted = users.map((user) => ({
        email: user.owner?.email || user.resident.email,
        name: user.name,
      }));

      await Promise.all([
        this.mailService.sendParcelRecivied({
          users: usersFormatted,
        }),
        this.notificationService.sendPushByAddress({
          roles: ['OWNER', 'RESIDENT'],
          title: 'Uma encomenda chegou!!!',
          body: `Chegou uma encomenda para o seu endereço. Corre lá para buscar!`,
          users: users.map((user) => ({ id: user.id })),
          address: { house: parcel.house, square: parcel.square },
        }),
      ]);

      resetParcels();
      resetParcel();
    } catch (error) {
      throw error;
    }
  }

  async blockParcel({ id }: { id: string }) {
    try {
      const parcel = await this.prisma.parcel.update({
        where: {
          id,
        },
        data: {
          status: 'PROCESSING',
        },
      });

      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            {
              owner: {
                house: parcel.house,
                square: parcel.square,
              },
            },
            {
              resident: {
                owner: {
                  house: parcel.house,
                  square: parcel.square,
                },
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          owner: {
            select: {
              email: true,
            },
          },
          resident: {
            select: {
              email: true,
            },
          },
        },
      });

      const usersFormatted = users.map((user) => ({
        email: user.owner?.email || user.resident.email,
        name: user.name,
      }));

      await Promise.all([
        this.mailService.sendParcelBlocked({
          users: usersFormatted,
        }),
        this.notificationService.sendPushByAddress({
          roles: ['OWNER', 'RESIDENT'],
          title: 'Sua encomenda precisa ser revisada',
          body: `Precisamos recadastrar sua encomenda, desculpe o incomodo. Logo te avisaremos quando ela estará disponível.`,
          users: users.map((user) => ({ id: user.id })),
          address: { house: parcel.house, square: parcel.square },
        }),
      ]);

      resetParcels();
      resetParcel();
    } catch (error) {
      throw error;
    }
  }

  async allowParcels({ ids }: { ids: Array<string> }) {
    try {
      const [parcels] = await Promise.all([
        this.prisma.parcel.findMany({
          where: {
            id: {
              in: ids,
            },
          },
          select: {
            recipient: {
              select: {
                id: true,
                name: true,
                owner: {
                  select: {
                    house: true,
                    square: true,
                    email: true,
                  },
                },
                resident: {
                  select: {
                    email: true,
                    owner: {
                      select: {
                        house: true,
                        square: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        this.prisma.parcel.updateMany({
          where: {
            id: {
              in: ids,
            },
          },
          data: {
            status: 'ALLOWED',
          },
        }),
      ]);

      // Organize users by address
      const usersByAddress = parcels.reduce(
        (acc, parcel) => {
          const recipient = parcel.recipient;
          if (!recipient) return acc;

          // Extract house and square from owner or resident
          const house =
            recipient.owner?.house || recipient.resident?.owner?.house;
          const square =
            recipient.owner?.square || recipient.resident?.owner?.square;

          if (!house || !square) return acc;

          const addressKey = `${house}-${square}`;

          if (!acc[addressKey]) {
            acc[addressKey] = {
              house,
              square,
              users: [],
            };
          }

          acc[addressKey].users.push({
            id: recipient.id,
            name: recipient.name,
            email: recipient.owner?.email || recipient.resident?.email,
          });

          return acc;
        },
        {} as Record<
          string,
          {
            house: string;
            square: string;
            users: Array<{ id: string; name: string; email: string }>;
          }
        >,
      );

      // Notify users grouped by house and square
      for (const addressKey in usersByAddress) {
        const { house, square, users } = usersByAddress[addressKey];

        const usersFormatted = users.map((user) => ({
          email: user.email,
          name: user.name,
        }));

        await Promise.all([
          this.mailService.sendParcelRecivied({
            users: usersFormatted,
          }),
          this.notificationService.sendPushByAddress({
            roles: ['OWNER', 'RESIDENT'],
            title: 'Uma encomenda chegou!!!',
            body: `Chegou uma encomenda para o seu endereço. Corre lá para buscar!`,
            users: users.map((user) => ({ id: user.id })),
            address: { house, square },
          }),
        ]);
      }

      resetParcels();
      resetParcel();
    } catch (error) {
      throw error;
    }
  }

  async blockParcels({ ids }: { ids: Array<string> }) {
    try {
      await this.prisma.parcel.updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data: {
          status: 'PROCESSING',
        },
      });

      resetParcels();
      resetParcel();
    } catch (error) {
      throw error;
    }
  }
}
