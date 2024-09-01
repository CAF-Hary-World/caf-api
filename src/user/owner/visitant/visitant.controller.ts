import {
  Controller,
  UseGuards,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Patch,
  Query,
} from '@nestjs/common';
import { OwnerVisitantService } from './visitant.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Justification, Prisma } from '@prisma/client';

@Controller('users/:id/owners')
export class OwnerVisitantController {
  constructor(private readonly visitantService: OwnerVisitantService) {}

  @UseGuards(AuthGuard)
  @Get('/:ownerId/visitants')
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
      console.log('List visitants');
      return visitants;
    } catch (error) {
      console.log('Controller error = ', error);

      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Resource not found',
        },
        HttpStatus.NOT_FOUND,
        {
          cause: error,
        },
      );
    }
  }

  @Get('/visitants/:visitantId')
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
      console.log('Controller error = ', error);

      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Resource not found',
        },
        HttpStatus.NOT_FOUND,
        {
          cause: error,
        },
      );
    }
  }

  @UseGuards(AuthGuard)
  @Post('/:ownerId/visitants')
  async createVisitant(
    @Body() visitant: Prisma.VisitantCreateInput & { invitedBy: string },
  ) {
    try {
      await this.visitantService.createVisitant({ visitant });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: error.message,
        },
        HttpStatus.UNAUTHORIZED,
        {
          cause: error,
        },
      );
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/:ownerId/visitants/remove')
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
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: error.message,
        },
        HttpStatus.UNAUTHORIZED,
        {
          cause: error,
        },
      );
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/:ownerId/visitants/add')
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
      console.log(error.code);
      throw new HttpException(
        {
          status:
            error.code !== 'P2002'
              ? HttpStatus.UNAUTHORIZED
              : HttpStatus.CONFLICT,
          error: error.message,
        },
        error.code !== 'P2002' ? HttpStatus.UNAUTHORIZED : HttpStatus.CONFLICT,
        {
          cause: error,
        },
      );
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/:ownerId/visitants/available')
  async updateAvailableStatus(
    @Body()
    data: {
      cpf: string;
      justifications: Array<Pick<Justification, 'description'>>;
    },
    @Param() { id, ownerId }: { id: string; ownerId: string },
  ) {
    const { cpf, justifications } = data;
    try {
      return await this.visitantService.updateAvailableStatus({
        cpf,
        id,
        justifications,
        ownerId,
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          status:
            error.code !== 'P2002'
              ? HttpStatus.UNAUTHORIZED
              : HttpStatus.CONFLICT,
          error: error.message,
        },
        HttpStatus.UNAUTHORIZED,
        {
          cause: error,
        },
      );
    }
  }
}
