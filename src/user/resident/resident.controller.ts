import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ResidentService } from './resident.service';

@Controller('residents')
export class ResidentController {
  constructor(private residentService: ResidentService) {}

  @Get('/belongsToOwner')
  @HttpCode(204)
  async belongsToOwner(@Query() { id }: { id: string }) {
    try {
      await this.residentService.belongsToOwner(id);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: error.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  @Patch('/:id')
  @HttpCode(204)
  async confirmation(
    @Param() { id }: { id: string },
    @Body() { password }: { password: string },
  ) {
    try {
      return await this.residentService.confirmation({ id, password });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: error.message,
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }
}
