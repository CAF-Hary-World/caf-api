import { Injectable } from '@nestjs/common';
import { Prisma, STATUS } from '@prisma/client';
import { parcelsInMemory, selectParcel } from 'src/libs/memory-cache';
import { MailService } from 'src/mail/mail.service';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetParcel, resetParcels } from 'src/utils/resetCache';

@Injectable()
export class ParcelService {
  constructor(
    private readonly prisma: PrismaService,
    private mailService: MailService,
    private readonly notificationService: NotificationService,
  ) {}

  async listParcels({
    page = 1,
    to,
    from,
    house,
    square,
    status,
  }: {
    page: number;
    to?: string;
    from?: string;
    house?: string;
    square?: string;
    status?: STATUS;
  }) {
    const reference = `parcels-${page}-${to}-${from}-${house}-${square}-${status}`;

    const where: Prisma.ParcelWhereInput = {
      ...(to && {
        recipient: { name: { contains: to, mode: 'insensitive' } },
      }),
      ...(from && { from: { contains: from, mode: 'insensitive' } }),
      ...(house && { house }),
      ...(square && { square }),
      ...(status && { status }),
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

  async createParcel(data: Prisma.ParcelCreateInput) {
    const { house, square } = data;
    try {
      const [users] = await Promise.all([
        this.prisma.user.findMany({
          where: {
            OR: [
              {
                owner: {
                  house: data.house,
                  square: data.square,
                },
              },
              {
                resident: {
                  owner: {
                    house,
                    square,
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
        }),
        this.prisma.parcel.create({
          data,
        }),
      ]);

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
          address: { house, square },
        }),
      ]);

      resetParcels();
      resetParcel();
    } catch (error) {
      throw error;
    }
  }
}
