import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Prisma, ROLE } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/role.guard';
import { OwnerService } from './owner.service';

@Controller('owners')
@UseGuards(AuthGuard, RolesGuard)
@Roles(ROLE.ADMIN, ROLE.ROOT)
export class OwnerController {
  constructor(private ownerService: OwnerService) {}

  @Get()
  async listOwners(
    @Query() { page, name, cpf }: { page: number; name?: string; cpf?: string },
  ) {
    try {
      return await this.ownerService.listOwners({ page, cpf, name });
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

  @Get('/:id/:ownerId')
  async getOwner(@Param() { id, ownerId }: { id: string; ownerId: string }) {
    try {
      return await this.ownerService.getOwner({ id, ownerId });
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

  @Post()
  async createOwner(
    @Body() data: Prisma.UserCreateInput & Prisma.OwnerCreateInput,
  ) {
    try {
      return await this.ownerService.createOwner(data);
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

  @Patch('/:id/:ownerId')
  async updateOwner(
    @Body() data: Prisma.UserUpdateInput & Prisma.OwnerUpdateInput,
    @Param() { id, ownerId }: { id: string; ownerId: string },
  ) {
    try {
      return await this.ownerService.updateOwner({ data, id, ownerId });
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

  @Delete('/:id/:ownerId')
  async deleteOwner(@Param() { id, ownerId }: { id: string; ownerId: string }) {
    try {
      return await this.ownerService.deleteOwner({ id, ownerId });
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

  @Delete('/delete-many')
  async deleteManyOwner(@Query() identifiers: string) {
    try {
      const ids = JSON.parse(identifiers) as {
        id: string;
        ownerId: string;
      }[];
      const result = await this.ownerService.deleteManyOwners(ids);
      return { message: `Deleted ${result.count} users`, count: result.count };
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
