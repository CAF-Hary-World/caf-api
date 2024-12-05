import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResidentVisitantService } from './visitant.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Prisma } from '@prisma/client';
import { handleErrors } from 'src/handles/errors';

@Controller('users/:id/residents/:residentId/visitants')
export class ResidentVisitantController {
  constructor(private readonly visitantService: ResidentVisitantService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listVisitants(
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
    @Param() { id, residentId }: { id: string; residentId: string },
  ) {
    try {
      const residentVisitants = await this.visitantService.listVisitants({
        id,
        residentId,
        page,
        name,
        cpf,
        allowed,
        blocked,
        pending,
        processing,
      });

      return residentVisitants;
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/remove')
  async removeVisitant(
    @Body() data: { id: string },
    @Param() { id, residentId }: { id: string; residentId: string },
  ) {
    try {
      return await this.visitantService.removeVisitant({
        id,
        residentId,
        visitantId: data.id,
      });
    } catch (error) {
      console.error(error);
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post()
  async createVisitant(
    @Body() visitant: Prisma.VisitantCreateInput & { invitedBy: string },
  ) {
    try {
      await this.visitantService.createVisitant({ visitant });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/add')
  async addVisitant(
    @Body() data: { cpf: string },
    @Param() { id, residentId }: { id: string; residentId: string },
  ) {
    try {
      return await this.visitantService.addVisitant({
        cpf: data.cpf,
        id,
        residentId,
      });
    } catch (error) {
      console.error(error.code);
      handleErrors(error);
    }
  }
}
