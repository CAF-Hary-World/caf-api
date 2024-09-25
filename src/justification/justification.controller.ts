import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JustificationService } from './justification.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { handleErrors } from 'src/handles/errors';

@Controller('justification')
export class JustificationController {
  constructor(private justificationService: JustificationService) {}

  @Get('/all')
  async listAll() {
    try {
      return await this.justificationService.list();
    } catch (error) {
      console.error(error);
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() { description }: { description: string }) {
    try {
      return await this.justificationService.create({ description });
    } catch (error) {
      console.error(error);
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  async delete(@Param() { id }: { id: string }) {
    try {
      return await this.justificationService.delete({ id });
    } catch (error) {
      console.log(error);
      handleErrors(error);
    }
  }
}
