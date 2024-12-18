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

@Controller('places/:placeId/bookings')
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
    @Param() { placeId }: { placeId: string },
  ) {
    try {
      return await this.bookingService.list({
        page,
        date,
        placeId,
        placeName,
        userName,
      });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async get(@Param() { id, placeId }: { id: string; placeId: string }) {
    try {
      return await this.bookingService.get({ id, placeId });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param() { id, placeId }: { id: string; placeId: string },
    @Body() data: Prisma.BookingUpdateInput,
  ) {
    try {
      return await this.bookingService.update({ id, data, placeId });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Param() { id, placeId }: { id: string; placeId: string }) {
    try {
      return await this.bookingService.delete({ id, placeId });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('delete-many')
  async deleteMany(
    @Query() { ids }: { ids: Array<string> },
    @Param() { placeId }: { placeId: string },
  ) {
    try {
      return await this.bookingService.deleteMany({ ids, placeId });
    } catch (error) {
      handleErrors(error);
    }
  }
}
