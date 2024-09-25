import {
  Controller,
  UseGuards,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Query,
} from '@nestjs/common';
import { OwnerVisitantService } from './visitant.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Prisma } from '@prisma/client';
import { handleErrors } from 'src/handles/errors';

@Controller('users/:id/owners/:ownerId/visitants')
export class OwnerVisitantController {
  constructor(private readonly visitantService: OwnerVisitantService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listVisitants(
    @Param() { id, ownerId }: { id: string; ownerId: string },
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
      const visitants = await this.visitantService.listVisitants({
        id,
        ownerId,
        page,
        name,
        cpf,
        allowed,
        blocked,
        pending,
        processing,
      });
      return visitants;
    } catch (error) {
      handleErrors(error);
    }
  }

  @Get('/:visitantId')
  async getVisitant(
    @Param() { id, visitantId }: { id: string; visitantId: string },
  ) {
    try {
      const visitant = await this.visitantService.getVisitant({
        userId: id,
        visitantId,
      });
      return visitant;
    } catch (error) {
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
  @Patch('/remove')
  async removeVisitant(
    @Body() data: { cpf: string },
    @Param() { id, ownerId }: { id: string; ownerId: string },
  ) {
    try {
      return await this.visitantService.removeVisitant({
        cpf: data.cpf,
        id,
        ownerId,
      });
    } catch (error) {
      console.error(error);
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/add')
  async addVisitant(
    @Body() data: { cpf: string },
    @Param() { id, ownerId }: { id: string; ownerId: string },
  ) {
    try {
      return await this.visitantService.addVisitant({
        cpf: data.cpf,
        id,
        ownerId,
      });
    } catch (error) {
      console.error(error.code);
      handleErrors(error);
    }
  }
}
