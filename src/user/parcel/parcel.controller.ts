import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

import { ROLE, STATUS } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { ParcelService } from './parcel.service';
import { handleErrors } from 'src/handles/errors';

interface CustomRequest extends ExpressRequest {
  user: {
    id: string;
    house: string;
    square: string;
  };
}

@Controller(`users/parcels`)
export class ParcelController {
  constructor(private parcelService: ParcelService) {}
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.RESIDENT, ROLE.OWNER, ROLE.ROOT)
  @Get()
  async listParcels(
    @Query()
    {
      page = 1,
      from,
      status,
    }: {
      page: number;
      from?: string;
      status?: Array<STATUS>;
    },
    @Request() req: CustomRequest,
  ) {
    try {
      const { house, square } = req.user;

      return await this.parcelService.listParcels({
        page,
        from,
        status,
        house,
        square,
      });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.RESIDENT, ROLE.OWNER, ROLE.ROOT)
  @Put('/:id/retrieve')
  async retrievedParcel(
    @Param() { id }: { id: string },
    @Request() req: CustomRequest,
  ) {
    try {
      const userId = req.user.id;
      await this.parcelService.retrievedParcel({ id, userId });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.RESIDENT, ROLE.OWNER, ROLE.ROOT)
  @Put('retrieve/many')
  async retrievedParcels(
    @Body() { ids }: { ids: Array<string> },
    @Request() req: CustomRequest,
  ) {
    try {
      const userId = req.user.id;
      await this.parcelService.retrievedParcels({ ids, userId });
    } catch (error) {
      handleErrors(error);
    }
  }
}
