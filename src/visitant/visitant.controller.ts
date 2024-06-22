import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VisitantService } from './visitant.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { Prisma, ROLE } from '@prisma/client';

@Controller('visitants')
export class VisitantController {
  constructor(private readonly visitantService: VisitantService) {}

  @UseGuards(AuthGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Get('/')
  async getVisitantByCPF(
    @Query()
    { page, name, cpf }: { page: number; name?: string; cpf?: string },
  ) {
    try {
      if (cpf) return await this.visitantService.getVisitantByCPF({ cpf });

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
  @Patch('/:id')
  async updateVisitant(
    @Param()
    { id }: { id: string },
    @Body() data: Prisma.VisitantUpdateInput,
  ) {
    try {
      return this.visitantService.updateVisitant({ data, id });
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
