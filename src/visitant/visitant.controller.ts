import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Prisma, ROLE } from '@prisma/client';

import { VisitantService } from './visitant.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { NotificationService } from 'src/notification/notification.service';
import { RolesGuard } from 'src/guards/role.guard';
import { handleErrors } from 'src/handles/errors';

import { Request as ExpressRequest } from 'express';

// Define CustomRequest interface extending the Express Request
interface CustomRequest extends ExpressRequest {
  user: {
    id: string;
    role: {
      name: ROLE;
    };
  };
}

@Controller('visitants')
export class VisitantController {
  constructor(
    private readonly visitantService: VisitantService,
    private readonly notificationService: NotificationService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('/')
  async getVisitants(
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
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/cpf/:cpf')
  async getVisitantByCPF(
    @Param()
    { cpf }: { cpf: string },
  ) {
    try {
      return await this.visitantService.getVisitantByCPF({
        cpf,
      });
    } catch (error) {
      handleErrors(error);
    }
  }

  @Get('/:id')
  async getVisitant(
    @Param()
    { id }: { id: string },
  ) {
    try {
      return await this.visitantService.getVisitant({ id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/:id/block')
  async blockVisitant(
    @Request() req: CustomRequest,
    @Param() { id }: { id: string; ownerId: string },
    @Body() { justifications }: { justifications: Array<string> },
  ) {
    try {
      return await this.visitantService.blockVisitant({
        id,
        justifications,
        role: req.user.role.name,
      });
    } catch (error) {
      handleErrors(error);
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
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  async updateVisitant(
    @Param()
    { id }: { id: string },
    @Body() data: Prisma.VisitantUpdateInput,
  ) {
    try {
      return await this.visitantService.updateVisitant({ data, id });
    } catch (error) {
      handleErrors(error);
    }
  }

  @Patch('/confirmation/:id')
  async confirmationVisitant(
    @Param()
    { id }: { id: string },
    @Body() data: Prisma.VisitantUpdateInput,
  ) {
    try {
      return await Promise.all([
        this.visitantService.confirmationVisitant({ data, id }),
        this.notificationService.sendsPushesByRole({
          title: 'Registro de visitante',
          body: `O visitante ${data.name} enviou seu os dados`,
          path: `/visitants/show/${id}`,
          roles: ['ADMIN', 'ROOT', 'SECURITY'],
        }),
      ]);
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/:id/allow')
  async allowVisitant(
    @Param()
    { id }: { id: string },
    @Request() req: CustomRequest,
  ) {
    try {
      return await this.visitantService.allowVisitant({
        id,
        role: req.user.role.name,
      });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT, ROLE.SECURITY)
  @Delete('/:id')
  async deleteVisitant(
    @Param()
    { id }: { id: string },
  ) {
    try {
      return await this.visitantService.deleteVisitant({ id });
    } catch (error) {
      handleErrors(error);
    }
  }
}
