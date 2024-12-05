import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResidentService } from './resident.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { handleErrors } from 'src/handles/errors';

@Controller('residents')
export class ResidentController {
  constructor(private residentService: ResidentService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listResidents(
    @Query()
    {
      page,
      name,
      cpf,
      allowed,
      blocked,
      processing,
    }: {
      page: number;
      name?: string;
      cpf?: string;
      blocked?: string;
      allowed?: string;
      processing?: string;
    },
  ) {
    try {
      const residents = await this.residentService.listResidents({
        page,
        name,
        cpf,
        allowed,
        blocked,
        processing,
      });
      return residents;
    } catch (error) {
      console.error('Controller error = ', error);

      handleErrors(error);
    }
  }

  @Get('/belongsToOwner')
  @HttpCode(204)
  async belongsToOwner(@Query() { id }: { id: string }) {
    try {
      await this.residentService.belongsToOwner(id);
    } catch (error) {
      console.error(error);
      handleErrors(error);
    }
  }

  @Patch('/:id')
  @HttpCode(204)
  async confirmation(
    @Param() { id }: { id: string },
    @Body() { password }: { password: string },
  ) {
    try {
      return await this.residentService.confirmation({ id, password });
    } catch (error) {
      console.error(error);
      handleErrors(error);
    }
  }
}
