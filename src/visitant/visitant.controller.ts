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
import { RolesGuard } from 'src/guards/role.guard';

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
    {
      page,
      name,
      cpf,
      allowed,
      blocked,
      pending,
      processing,
    }: {
      page: number;
      name?: string;
      cpf?: string;
      blocked?: string;
      allowed?: string;
      processing?: string;
      pending?: string;
    },
  ) {
    try {
      if (cpf && !name)
        return await this.visitantService.getVisitantByCPF({ cpf });

      return await this.visitantService.getVisitants({
        page,
        cpf,
        name,
        allowed,
        blocked,
        pending,
        processing,
      });
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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Patch('/:id/block')
  async blockVisitant(
    @Param() { id }: { id: string; ownerId: string },
    @Body() { justifications }: { justifications: Array<string> },
  ) {
    try {
      return await this.visitantService.blockVisitant({
        id,
        justifications,
      });
    } catch (error) {
      console.error('Controller error = ', error);

      // If the error is already an HttpException, just rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      // Otherwise, throw a generic error or add more context if needed
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'An unexpected error occurred while blocking the visitant',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Patch('/:id/reject')
  async rejectVisitant(
    @Param() { id }: { id: string; ownerId: string },
    @Body() { justifications }: { justifications: Array<string> },
  ) {
    try {
      return await this.visitantService.rejectVisitant({
        id,
        justifications,
      });
    } catch (error) {
      console.error('Controller error = ', error);

      // If the error is already an HttpException, just rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      // Otherwise, throw a generic error or add more context if needed
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'An unexpected error occurred while blocking the visitant',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
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

  @Patch('/confirmation/:userId/:id')
  async confirmationVisitant(
    @Param()
    { id, userId }: { id: string; userId: string },
    @Body() data: Prisma.VisitantUpdateInput,
  ) {
    try {
      await this.visitantService.confirmationVisitant({ data, id });
      await this.notificationService.sendsPushesByRole({
        title: 'Registro de visitante',
        body: `O visitante ${data.name} enviou seu os dados`,
        path: `/visitants/show/${id}`,
        roles: ['ADMIN', 'ROOT', 'SECURITY'],
      });
      return await this.notificationService.sendPushToUser({
        title: 'Registro de visitante',
        body: `O visitante ${data.name} enviou seu os dados`,
        path: `/visitants/show/${id}`,
        role: 'OWNER',
        userId,
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

  @UseGuards(AuthGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Patch('/:id/allow')
  async allowVisitant(
    @Param()
    { id }: { id: string },
  ) {
    try {
      return await this.visitantService.allowVisitant({ id });
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
}
