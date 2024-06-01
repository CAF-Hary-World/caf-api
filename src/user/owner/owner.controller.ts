import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ROLE } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { OwnerService } from './owner.service';

@Controller('owners')
@UseGuards(AuthGuard, RolesGuard)
export class OwnerController {
  constructor(private ownerService: OwnerService) {}

  @Get()
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  async listOwners(
    @Query() { page, name, cpf }: { page: number; name?: string; cpf?: string },
  ) {
    try {
      await this.ownerService.listOwners({ page, cpf, name });
    } catch (error) {
      console.log('Controller error = ', error);

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
