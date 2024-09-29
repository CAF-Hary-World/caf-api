import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ServiceService } from './service.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { handleErrors } from 'src/handles/errors';

@Controller('services')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listOwners(@Query() { page, name }: { page: number; name?: string }) {
    try {
      return await this.serviceService.listServices({ page, name });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getOwner(@Param() { id }: { id: string }) {
    try {
      return await this.serviceService.getService({ id });
    } catch (error) {
      handleErrors(error);
    }
  }
}
