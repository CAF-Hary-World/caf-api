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
} from '@nestjs/common';
import { OwnerVisitantService } from './visitant.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Prisma } from '@prisma/client';

@Controller('users/:id/owners/:ownerId/visitants')
export class OwnerVisitantController {
  constructor(private readonly visitantService: OwnerVisitantService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listVisitants(
    @Param() { id, ownerId }: { id: string; ownerId: string },
  ) {
    try {
      const ownerVisitants = await this.visitantService.listVisitants({
        id,
        ownerId,
      });

      return ownerVisitants
        .map((ownerVisitant) => ownerVisitant.owner.visitants)
        .flat();
    } catch (error) {
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
  @Post()
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
  @Patch()
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
      console.log(error);
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
}
