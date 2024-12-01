import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Prisma, ROLE, STATUS } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { ParcelService } from './parcel.service';
import { handleErrors } from 'src/handles/errors';

@Controller('parcels')
export class ParcelController {
  constructor(private parcelService: ParcelService) {}
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Get()
  async listParcels(
    @Query()
    {
      page = 1,
      recipient,
      from,
      house,
      square,
      status,
    }: {
      page: number;
      recipient?: string;
      from?: string;
      house?: string;
      square?: string;
      status?: Array<STATUS>;
    },
  ) {
    try {
      return await this.parcelService.listParcels({
        page,
        recipient,
        from,
        house,
        square,
        status,
      });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Post()
  async createParcel(
    @Body()
    data: Prisma.ParcelCreateInput & { serviceName?: string; userId?: string },
  ) {
    try {
      await this.parcelService.createParcel(data);
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Put('/:id')
  async updateParcel(
    @Body() data: Prisma.ParcelUpdateInput,
    @Param() { id }: { id: string },
  ) {
    try {
      await this.parcelService.updateParcel({ data, where: { id } });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Put('/:id/retrieve')
  async retrievedParcel(
    @Param() { id }: { id: string },
    @Body() { cpf }: { cpf: string },
  ) {
    try {
      await this.parcelService.retrievedParcel({ id, cpf });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Put('retrieve/many')
  async retrievedParcels(
    @Body() { ids, cpf }: { ids: Array<string>; cpf: string },
  ) {
    try {
      await this.parcelService.retrievedParcels({ ids, cpf });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Put('allow/:id')
  async allowParcel(@Param() { id }: { id: string }) {
    try {
      await this.parcelService.allowParcel({ id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Put('allow/many')
  async allowParcels(@Body() { ids }: { ids: Array<string> }) {
    try {
      await this.parcelService.allowParcels({ ids });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Put('blocked/:id')
  async blockedParcel(@Param() { id }: { id: string }) {
    try {
      await this.parcelService.blockParcel({ id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Put('blocked/many')
  async blockedParcels(@Body() { ids }: { ids: Array<string> }) {
    try {
      await this.parcelService.blockParcels({ ids });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Delete('/:id')
  async deleteParcel(@Param() { id }: { id: string }) {
    try {
      await this.parcelService.deleteParcel({ id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Delete('/many')
  async deleteManyParcels(@Query() { ids }: { ids: Array<string> }) {
    try {
      await this.parcelService.deleteManyParcel({ ids });
    } catch (error) {
      handleErrors(error);
    }
  }
}
