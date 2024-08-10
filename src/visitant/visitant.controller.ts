import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Prisma, ROLE } from '@prisma/client';

import { VisitantService } from './visitant.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { NotificationService } from 'src/notification/notification.service';

@Controller('visitants')
export class VisitantController {
  private readonly logger = new Logger(VisitantController.name);
  constructor(
    private readonly visitantService: VisitantService,
    private readonly notificationService: NotificationService,
  ) {}

  @UseGuards(AuthGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Get('/')
  async getVisitantByCPF(
    @Query()
    { page, name, cpf }: { page: number; name?: string; cpf?: string },
  ) {
    try {
      if (cpf && !name)
        return await this.visitantService.getVisitantByCPF({ cpf });

      return await this.visitantService.getVisitants({ page, cpf, name });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
        {
          cause: error,
        },
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getVisitant(
    @Param()
    { id }: { id: string },
  ) {
    try {
      return await this.visitantService.getVisitant({ id });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
        {
          cause: error,
        },
      );
    }
  }

  @UseGuards(AuthGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Patch('/:id')
  async updateVisitant(
    @Param()
    { id }: { id: string },
    @Body() data: Prisma.VisitantUpdateInput,
  ) {
    try {
      return await this.visitantService.updateVisitant({ data, id });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
        {
          cause: error,
        },
      );
    }
  }

  @Patch('/confirmation/:id')
  async confirmationVisitant(
    @Param()
    { id }: { id: string },
    @Body() data: Prisma.VisitantUpdateInput,
  ) {
    try {
      await this.visitantService.updateVisitant({ data, id });
      return await this.notificationService.sendsPushesByRole({
        title: 'Registro de visitante',
        body: `O visitante ${data.name} enviou seu os dados`,
        roles: ['ADMIN', 'ROOT', 'SECURITY'],
      });
    } catch (error) {
      this.logger.debug('error', error);
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
        {
          cause: error,
        },
      );
    }
  }
}
