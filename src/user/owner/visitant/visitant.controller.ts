import {
  Controller,
  UseGuards,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OwnerVisitantService } from './visitant.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users/:id/owners/:ownerId/visitants')
export class OwnerVisitantController {
  constructor(private readonly visitantService: OwnerVisitantService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listVisitants(
    @Param() { id, ownerId }: { id: string; ownerId: string },
  ) {
    try {
      return await this.visitantService.listVisitants({ id, ownerId });
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
}
