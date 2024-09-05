import {
  Controller,
  UseGuards,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Patch,
  Query,
} from '@nestjs/common';
import { OwnerResidentService } from './resident.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Prisma } from '@prisma/client';

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

      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Resource not found',
        },
        HttpStatus.NOT_FOUND,
        {
          cause: error,
        },
      );
    }
  }

  @UseGuards(AuthGuard)
  @Post()
  async createResident(
    @Body()
    {
      user,
      ownerId,
    }: {
      user: Prisma.UserCreateInput & { resident: Prisma.ResidentCreateInput };
      ownerId: string;
    },
  ) {
    try {
      await this.residentService.createResident({ user, ownerId });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: error.message,
        },
        HttpStatus.UNAUTHORIZED,
        {
          cause: error,
        },
      );
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/remove')
  async removeResident(
    @Body() data: { cpf: string },
    @Param() { id, ownerId }: { id: string; ownerId: string },
  ) {
    try {
      return await this.residentService.removeResident({
        cpf: data.cpf,
        id,
        ownerId,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: error.message,
        },
        HttpStatus.UNAUTHORIZED,
        {
          cause: error,
        },
      );
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
      console.error(error);
      throw new HttpException(
        {
          status:
            error.code !== 'P2002'
              ? HttpStatus.UNAUTHORIZED
              : HttpStatus.CONFLICT,
          error: error.message,
        },
        HttpStatus.UNAUTHORIZED,
        {
          cause: error,
        },
      );
    }
  }
}
