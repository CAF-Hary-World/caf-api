import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ServicePermissionService } from './permission.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { ROLE } from '@prisma/client';
import { handleErrors } from 'src/handles/errors';

@Controller('users/services/permissions')
export class ServicePermissionController {
  constructor(private readonly servicePermission: ServicePermissionService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.OWNER, ROLE.RESIDENT)
  @Get('/:id')
  async listServicePermission(@Param() { id }: { id: string }) {
    try {
      return await this.servicePermission.listServicePermission({ userId: id });
    } catch (error) {
      handleErrors(error);
    }
  }
}
