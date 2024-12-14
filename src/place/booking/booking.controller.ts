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

@Controller()
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
  ) {
    try {
      return await this.bookingService.list({
        page,
        date,
        placeName,
        userName,
      });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async get(@Param() { id }: { id: string }) {
    try {
      return await this.bookingService.get({ id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param() { id }: { id: string },
    @Body() data: Prisma.BookingUpdateInput,
  ) {
    try {
      return await this.bookingService.update({ id, data });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Param() { id }: { id: string }) {
    try {
      return await this.bookingService.delete({ id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('delete-many')
  async deleteMany(@Query() { ids }: { ids: Array<string> }) {
    try {
      return await this.bookingService.deleteMany({ ids });
    } catch (error) {
      handleErrors(error);
    }
  }
}
