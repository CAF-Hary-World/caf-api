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
    userId,
    placeName,
    date,
  }: {
    page: number;
    userId: string;
    placeName?: string;
    userName?: string;
    date?: string;
  }) {
    const reference = `booking-${userName}-${userId}-${placeName}-${date}-${page}`;

    const perPage =
      process.env.NODE_ENV === 'development'
        ? 2
        : Number(process.env.DEFAULT_PER_PAGE);

    const where: Prisma.BookingWhereInput = {
      user: {
        id: userId,
      },
      ...(userName && {
        user: { name: { contains: userName, mode: 'insensitive' } },
      }),
      ...(placeName && {
        user: { name: { contains: placeName, mode: 'insensitive' } },
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

  async get({ id, userId }: { id: string; userId: string }) {
    const reference = `booking-${id}`;

    try {
      if (!bookingInMemory.hasItem(reference)) {
        const booking = await this.prisma.booking.findUniqueOrThrow({
          where: { id, user: { id: userId } },
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

  async update({
    id,
    data,
    userId,
  }: {
    id: string;
    data: Prisma.BookingUpdateInput;
    userId: string;
  }) {
    try {
      await this.prisma.booking.update({
        where: { id, user: { id: userId } },
        data,
      });
      resetBooking();
      return;
    } catch (error) {
      throw error;
    }
  }

  async delete({ id, userId }: { id: string; userId: string }) {
    try {
      await this.prisma.booking.delete({
        where: { id, user: { id: userId } },
      });
      resetBooking();
      return;
    } catch (error) {
      throw error;
    }
  }

  async deleteMany({ ids, userId }: { ids: Array<string>; userId: string }) {
    try {
      await this.prisma.booking.deleteMany({
        where: { id: { in: ids }, user: { id: userId } },
      });
      resetBooking();
      return;
    } catch (error) {
      throw error;
    }
  }
}
