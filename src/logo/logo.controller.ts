import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { handleErrors } from 'src/handles/errors';
import { LogoService } from './logo.service';

@Controller('logo')
export class LogoController {
  constructor(private logoService: LogoService) {}

  @UseGuards(AuthGuard)
  @Get('/:name')
  async getLogo(@Param() { name }: { name: string }) {
    try {
      return await this.logoService.getLogo({ name });
    } catch (error) {
      handleErrors(error);
    }
  }
}
