import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VisitantService } from './visitant.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('visitants')
export class VisitantController {
  constructor(private readonly visitantService: VisitantService) {}

  @UseGuards(AuthGuard)
  @Get('/')
  async getVisitantByCPF(@Query('cpf') cpf: string) {
    try {
      return await this.visitantService.getVisitantByCPF({ cpf });
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
