import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  bookingInMemory,
  bookingsInMemory,
  selectBooking,
} from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetBooking } from 'src/utils/resetCache';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async list({
    page = 1,
    userName,
    placeName,
    date,
  }: {
    page: number;
    userName?: string;
    placeName?: string;
    date?: string;
  }) {
    const reference = `booking-${userName}-${placeName}-${date}-${page}`;

    const perPage =
      process.env.NODE_ENV === 'development'
        ? 2
        : Number(process.env.DEFAULT_PER_PAGE);

    const where: Prisma.BookingWhereInput = {
      ...(userName && {
        user: { name: { contains: userName, mode: 'insensitive' } },
      }),
      ...(placeName && {
        place: { name: { contains: placeName, mode: 'insensitive' } },
      }),
      ...(date && {
        date,
      }),
    };

    const bookingCount = await this.prisma.booking.count({
      where,
    });

    const totalPages = Math.ceil(bookingCount / perPage);

    try {
      if (!bookingsInMemory.hasItem(reference)) {
        const bookings = await this.prisma.booking.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
          ...selectBooking,
        });

        bookingsInMemory.storeExpiringItem(
          reference,
          bookings,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }

      return {
        resource: bookingsInMemory.retrieveItemValue(reference),
        totalPages,
      };
    } catch (error) {
      throw error;
    }
  }

  async get({ id }: { id: string }) {
    const reference = `booking-${id}`;

    try {
      if (!bookingInMemory.hasItem(reference)) {
        const booking = await this.prisma.booking.findUniqueOrThrow({
          where: { id },
          ...selectBooking,
        });

        bookingInMemory.storeExpiringItem(
          reference,
          booking,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24,
        );
      }
      return bookingInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw error;
    }
  }

  async update({ id, data }: { id: string; data: Prisma.BookingUpdateInput }) {
    try {
      await this.prisma.booking.update({ where: { id }, data });
      resetBooking();
      return;
    } catch (error) {
      throw error;
    }
  }

  async delete({ id }: { id: string }) {
    try {
      await this.prisma.booking.delete({ where: { id } });
      resetBooking();
      return;
    } catch (error) {
      throw error;
    }
  }

  async deleteMany({ ids }: { ids: Array<string> }) {
    try {
      await this.prisma.booking.deleteMany({ where: { id: { in: ids } } });
      resetBooking();
      return;
    } catch (error) {
      throw error;
    }
  }
}
