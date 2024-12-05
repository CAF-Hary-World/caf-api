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
import { ProviderService } from './provider.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { handleErrors } from 'src/handles/errors';
import { Prisma, ROLE } from '@prisma/client';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/role.guard';

@Controller('provider')
export class ProviderController {
  constructor(private providerService: ProviderService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listProviders(
    @Query() { page, name }: { page: number; name?: string },
  ) {
    try {
      return await this.providerService.listProviders({ page, name });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getProvider(@Param() { id }: { id: string }) {
    try {
      return await this.providerService.getProvider({ id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Delete('/:id')
  async deleteProvider(@Param() { id }: { id: string }) {
    try {
      return await this.providerService.deleteProvider({ id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Delete('/delete-many')
  async deleteManyProvider(@Body() { ids }: { ids: Array<string> }) {
    try {
      return await this.providerService.deleteManyProvider({ ids });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post()
  async createProvider(@Body() data: Prisma.ProviderCreateInput) {
    try {
      return await this.providerService.createProvider(data);
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Put('/:id')
  async updateProvider(
    @Body() data: Prisma.ProviderUpdateInput,
    @Param() { id }: { id: string },
  ) {
    try {
      return await this.providerService.updateProvider({ ...data, id });
    } catch (error) {
      handleErrors(error);
    }
  }
}
