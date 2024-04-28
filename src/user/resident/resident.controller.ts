import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ResidentService } from './resident.service';

@Controller('resident')
export class ResidentController {
  constructor(private residentService: ResidentService) {}

  @Get('/belongsToOwner')
  @HttpCode(204)
  async belongsToOwner(@Query() { id }: { id: string }) {
    try {
      await this.residentService.belongsToOwner(id);
    } catch (error) {
      console.log(error);
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
