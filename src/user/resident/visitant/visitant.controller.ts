import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ResidentVisitantService } from './visitant.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users/:id/residents/:residentId/visitants')
export class ResidentVisitantController {
  constructor(private readonly visitantService: ResidentVisitantService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listVisitants(
    @Param() { id, residentId }: { id: string; residentId: string },
  ) {
    try {
      const residentVisitants = await this.visitantService.listVisitants({
        id,
        residentId,
      });

      return residentVisitants
        .map((residentVisitant) => residentVisitant.resident.visitants)
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
}
