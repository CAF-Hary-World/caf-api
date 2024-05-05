import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { JustificationService } from './justification.service';

@Controller('justification')
export class JustificationController {
  constructor(private justificationService: JustificationService) {}

  @Get('/all')
  async listAll() {
    try {
      return await this.justificationService.list();
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
