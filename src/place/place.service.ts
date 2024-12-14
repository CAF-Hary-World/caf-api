import { Injectable } from '@nestjs/common';
import { Prisma, STATUS } from '@prisma/client';
import {
  placesWithoutBookingsInMemory,
  placeWithBookingsInMemory,
  placeWithoutBookingsInMemory,
  selectPlaceWithBookings,
  selectPlaceWithoutBookings,
} from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetPlace } from 'src/utils/resetCache';
import { timeStampISOTime } from 'src/utils/time';

@Injectable()
export class PlaceService {
  constructor(private readonly prisma: PrismaService) {}

  async list({
    page = 1,
    name,
    status,
  }: {
    page: number;
    name?: string;
    status?: STATUS;
  }) {
    const reference = `user-place-${page}-${name}-${status}`;

    const perPage =
      process.env.NODE_ENV === 'development'
        ? 2
        : Number(process.env.DEFAULT_PER_PAGE);

    const where: Prisma.PlaceWhereInput = {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(status && { status }),
    };

    const placesCount = await this.prisma.place.count({
      where,
    });

    const totalPages = Math.ceil(placesCount / perPage);

    try {
      if (!placesWithoutBookingsInMemory.hasItem(reference)) {
        const places = await this.prisma.place.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
          ...selectPlaceWithoutBookings,
        });

        placesWithoutBookingsInMemory.storeExpiringItem(
          reference,
          places,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }

      return {
        resource: placesWithoutBookingsInMemory.retrieveItemValue(reference),
        totalPages,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPlaceWithBookings({ id }: { id: string }) {
    const reference = `place-${id}-with-bookings`;

    try {
      if (!placeWithBookingsInMemory.hasItem(reference)) {
        const place = await this.prisma.place.findUniqueOrThrow({
          where: { id },
          ...selectPlaceWithBookings,
        });

        placeWithBookingsInMemory.storeExpiringItem(
          reference,
          place,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return placeWithBookingsInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw error;
    }
  }

  async getPlaceWithoutBookings({ id }: { id: string }) {
    const reference = `place-${id}-without-bookings`;

    try {
      if (!placeWithoutBookingsInMemory.hasItem(reference)) {
        const place = await this.prisma.place.findUniqueOrThrow({
          where: { id },
          ...selectPlaceWithoutBookings,
        });

        placeWithoutBookingsInMemory.storeExpiringItem(
          reference,
          place,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return placeWithoutBookingsInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw error;
    }
  }

  async create(data: Prisma.PlaceCreateInput) {
    try {
      await this.prisma.place.create({
        data: {
          ...data,
          createdAt: timeStampISOTime,
        },
      });
      resetPlace();
    } catch (error) {
      throw error;
    }
  }

  async update({ data, id }: { data: Prisma.PlaceUpdateInput; id: string }) {
    try {
      await this.prisma.place.update({
        where: {
          id,
        },
        data: {
          ...data,
          updatedAt: timeStampISOTime,
        },
      });
      resetPlace();
    } catch (error) {
      throw error;
    }
  }

  async delete({ id }: { id: string }) {
    try {
      await this.prisma.place.delete({
        where: {
          id,
        },
      });
      resetPlace();
    } catch (error) {
      throw error;
    }
  }

  async deleteMany({ ids }: { ids: Array<string> }) {
    try {
      await this.prisma.place.deleteMany({
        where: {
          id: { in: ids },
        },
      });
      resetPlace();
    } catch (error) {
      throw error;
    }
  }
}
