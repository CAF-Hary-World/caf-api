import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JustificationService } from './justification.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('justification')
export class JustificationController {
  constructor(private justificationService: JustificationService) {}

  @Get('/all')
  async listAll() {
    try {
      return await this.justificationService.list();
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
  @Post()
  async create(@Body() { description }: { description: string }) {
    try {
      return await this.justificationService.create({ description });
    } catch (error) {
      console.error(error);
      // If the error is already an HttpException, just rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      // Otherwise, throw a generic error or add more context if needed
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'An unexpected error occurred while creating the owner',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async delete(@Param() { id }: { id: string }) {
    try {
      return await this.justificationService.delete({ id });
    } catch (error) {
      // If the error is already an HttpException, just rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      // Otherwise, throw a generic error or add more context if needed
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'An unexpected error occurred while creating the owner',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
