import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ROLE, STATUS } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { ParcelService } from './parcel.service';
import { handleErrors } from 'src/handles/errors';

@Controller('parcels')
export class ParcelController {
  constructor(private parcelService: ParcelService) {}
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Get()
  async listParcels(
    @Query()
    {
      page = 1,
      to,
      from,
      house,
      square,
      status,
    }: {
      page: number;
      to?: string;
      from?: string;
      house?: string;
      square?: string;
      status?: STATUS;
    },
  ) {
    try {
      return await this.parcelService.listParcels({
        page,
        to,
        from,
        house,
        square,
        status,
      });
    } catch (error) {
      handleErrors(error);
    }
  }
}
