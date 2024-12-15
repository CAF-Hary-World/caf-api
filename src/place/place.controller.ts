import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Prisma, ROLE, STATUS } from '@prisma/client';
import { Roles } from 'src/decorator/roles.decorator';
import { handleErrors } from 'src/handles/errors';

@Controller('places')
export class PlaceController {
  constructor(private placeService: PlaceService) {}

  @UseGuards(AuthGuard)
  @Get()
  async list(
    @Query()
    { page, name, status }: { page: number; name?: string; status?: STATUS },
  ) {
    try {
      return await this.placeService.list({ page, status, name });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async get(
    @Param()
    { id }: { id: string },
    @Query() { withBooking }: { withBooking: boolean },
  ) {
    try {
      return withBooking
        ? await this.placeService.getPlaceWithBookings({ id })
        : await this.placeService.getPlaceWithoutBookings({ id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Post()
  async create(@Body() data: Prisma.PlaceCreateInput) {
    try {
      return await this.placeService.create(data);
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Patch('/:id')
  async update(
    @Body() data: Prisma.PlaceUpdateInput,
    @Param() { id }: { id: string },
  ) {
    try {
      return await this.placeService.update({ data, id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Delete('/:id')
  async delete(@Param() { id }: { id: string }) {
    try {
      return await this.placeService.delete({ id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Delete('/delete-many')
  async deleteMany(@Param() { ids }: { ids: Array<string> }) {
    try {
      return await this.placeService.deleteMany({ ids });
    } catch (error) {
      handleErrors(error);
    }
  }
}
