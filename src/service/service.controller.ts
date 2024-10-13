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
import { ServiceService } from './service.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { handleErrors } from 'src/handles/errors';
import { Prisma, ROLE } from '@prisma/client';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorator/roles.decorator';

@Controller('services')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listServices(@Query() { page, name }: { page: number; name?: string }) {
    try {
      return await this.serviceService.listServices({ page, name });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getService(@Param() { id }: { id: string }) {
    try {
      return await this.serviceService.getService({ id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Delete('/:id')
  async deleteService(@Param() { id }: { id: string }) {
    try {
      return await this.serviceService.deleteService({ id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Delete('/delete-many')
  async deleteManyService(@Body() { ids }: { ids: Array<string> }) {
    try {
      return await this.serviceService.deleteManyService({ ids });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post()
  async createService(@Body() data: Prisma.ServiceCreateInput) {
    try {
      return await this.serviceService.createService(data);
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Put('/:id')
  async updateService(
    @Body() data: Prisma.ServiceUpdateInput,
    @Param() { id }: { id: string },
  ) {
    try {
      return await this.serviceService.updateService({ ...data, id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post('/:id/permission')
  async createPermissionService(
    @Body()
    {
      serviceId,
      userId,
      providerId,
    }: {
      userId: string;
      serviceId: string;
      providerId?: string;
    },
  ) {
    try {
      return await this.serviceService.createServicePermission({
        userId,
        serviceId,
        providerId,
      });
    } catch (error) {
      handleErrors(error);
    }
  }
}
