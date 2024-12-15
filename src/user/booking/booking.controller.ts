import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { handleErrors } from 'src/handles/errors';
import { Prisma } from '@prisma/client';

@Controller('users/:userId/bookings')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @UseGuards(AuthGuard)
  @Get()
  async list(
    @Query()
    {
      page = 1,
      userName,
      placeName,
      date,
    }: {
      page: number;
      userName?: string;
      placeName?: string;
      date?: string;
    },
    @Param() { userId }: { userId: string },
  ) {
    try {
      return await this.bookingService.list({
        page,
        date,
        userId,
        placeName,
        userName,
      });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async get(@Param() { id, userId }: { id: string; userId: string }) {
    try {
      return await this.bookingService.get({ id, userId });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param() { id, userId }: { id: string; userId: string },
    @Body() data: Prisma.BookingUpdateInput,
  ) {
    try {
      return await this.bookingService.update({ id, data, userId });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Param() { id, userId }: { id: string; userId: string }) {
    try {
      return await this.bookingService.delete({ id, userId });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('delete-many')
  async deleteMany(
    @Query() { ids }: { ids: Array<string> },
    @Param() { userId }: { userId: string },
  ) {
    try {
      return await this.bookingService.deleteMany({ ids, userId });
    } catch (error) {
      handleErrors(error);
    }
  }
}
