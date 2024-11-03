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
import { KIND, Prisma, ROLE } from '@prisma/client';
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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.OWNER, ROLE.RESIDENT)
  @Post('/:id/permissions')
  async createPermissionService(
    @Body()
    {
      userId,
      provider,
    }: {
      userId: string;
      provider?: {
        name: string;
        kind: KIND;
        plate?: string;
        document: string;
      };
    },
    @Param() { id }: { id: string },
  ) {
    try {
      return await this.serviceService.createServicePermission({
        userId,
        serviceId: id,
        provider,
      });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/:id/permission/:servicePermissionId')
  async deletePermissionService(
    @Param()
    { servicePermissionId }: { servicePermissionId: string },
  ) {
    try {
      return await this.serviceService.deleteServicePermission({
        id: servicePermissionId,
      });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/:id/permission/delete-many')
  async deleteManyPermissionService(
    @Body()
    { ids }: { ids: Array<string> },
  ) {
    try {
      return await this.serviceService.deleteManyServicePermission({
        ids,
      });
    } catch (error) {
      handleErrors(error);
    }
  }
}
