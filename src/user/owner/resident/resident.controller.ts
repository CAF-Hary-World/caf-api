import {
  Controller,
  UseGuards,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';

import { OwnerResidentService } from './resident.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Prisma } from '@prisma/client';
import { handleErrors } from 'src/handles/errors';

@Controller('users/:id/owners/:ownerId/residents')
export class OwnerResidentController {
  constructor(private readonly residentService: OwnerResidentService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listResidents(
    @Param() { id, ownerId }: { id: string; ownerId: string },
    @Query() { page, name, cpf }: { page: number; name?: string; cpf?: string },
  ) {
    try {
      const residents = await this.residentService.listResidents({
        id,
        ownerId,
        page,
        name,
        cpf,
      });
      return residents;
    } catch (error) {
      console.error('Controller error = ', error);

      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post()
  async createResident(
    @Param() { ownerId }: { ownerId: string },
    @Body()
    resident: Prisma.UserCreateInput & Prisma.ResidentCreateInput,
  ) {
    try {
      await this.residentService.createResident({ resident, ownerId });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/:userResidentId/:residentId')
  async removeResident(
    @Param()
    {
      id,
      ownerId,
      residentId,
      userResidentId,
    }: {
      id: string;
      ownerId: string;
      userResidentId: string;
      residentId: string;
    },
  ) {
    try {
      return await this.residentService.removeResident({
        residentId,
        userResidentId,
        id,
        ownerId,
      });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/update')
  async updateResident(
    @Body()
    user: Prisma.UserCreateInput & { resident: Prisma.ResidentCreateInput },
    @Param() { id, ownerId }: { id: string; ownerId: string },
  ) {
    try {
      return await this.residentService.updateResident({
        id,
        ownerId,
        residentId: user.resident.id,
        user,
      });
    } catch (error) {
      handleErrors(error);
    }
  }
}
