import { Injectable } from '@nestjs/common';
import { Prisma, STATUS } from '@prisma/client';
import { parcelsInMemory, selectParcel } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetParcel, resetParcels } from 'src/utils/resetCache';

@Injectable()
export class ParcelService {
  constructor(private readonly prisma: PrismaService) {}

  async listParcels({
    page = 1,
    from,
    status = ['ALLOWED', 'RETRIEVED'],
    house,
    square,
  }: {
    page: number;
    from?: string;
    status?: Array<STATUS>;
    house: string;
    square: string;
  }) {
    const reference = `parcels-${page}-${from}-${status}-${house}-${square}`;

    const perPage =
      process.env.NODE_ENV === 'development'
        ? 2
        : Number(process.env.DEFAULT_PER_PAGE);

    try {
      const where: Prisma.ParcelWhereInput = {
        ...(from && {
          service: { name: { contains: from, mode: 'insensitive' } },
        }),
        status: { in: status },
        house,
        square,
      };

      const parcelsCount = await this.prisma.parcel.count({
        where,
      });

      const totalPages = Math.ceil(parcelsCount / perPage);

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

  async retrievedParcel({ id, userId }: { id: string; userId: string }) {
    try {
      const [user, parcel] = await Promise.all([
        this.prisma.user.findUniqueOrThrow({
          where: {
            id: userId,
          },
          select: {
            id: true,
            owner: {
              select: {
                house: true,
                square: true,
              },
            },
            resident: {
              select: {
                owner: {
                  select: {
                    house: true,
                    square: true,
                  },
                },
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

      const { house, square } = user.owner || user.resident.owner;

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
          withdrawnById: user.id,
          status: 'RETRIEVED',
        },
      });
      resetParcels();
      resetParcel();
    } catch (error) {
      throw error;
    }
  }

  async retrievedParcels({
    ids,
    userId,
  }: {
    ids: Array<string>;
    userId: string;
  }) {
    try {
      const [user, parcels] = await Promise.all([
        this.prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
            owner: {
              select: {
                house: true,
                square: true,
              },
            },
            resident: {
              select: {
                owner: {
                  select: {
                    house: true,
                    square: true,
                  },
                },
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

      const { house, square } = user.owner || user.resident.owner;

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
          withdrawnById: user.id,
          status: 'RETRIEVED',
        },
      });
      resetParcels();
      resetParcel();
    } catch (error) {
      throw error;
    }
  }
}
