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
import { handleErrors } from 'src/handles/errors';

@Controller('owners')
export class OwnerController {
  constructor(private ownerService: OwnerService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Get()
  async listOwners(
    @Query() { page, name, cpf }: { page: number; name?: string; cpf?: string },
  ) {
    try {
      return await this.ownerService.listOwners({ page, cpf, name });
    } catch (error) {
      handleErrors(error);
    }
  }

  @Get('/:id/:ownerId')
  async getOwner(@Param() { id, ownerId }: { id: string; ownerId: string }) {
    try {
      return await this.ownerService.getOwner({ id, ownerId });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Get('/:id/:ownerId/send-invite')
  async getSendInvite(
    @Param() { id, ownerId }: { id: string; ownerId: string },
  ) {
    try {
      return await this.ownerService.sendInvite({ id, ownerId });
    } catch (error) {
      handleErrors(error);
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Post()
  async createOwner(
    @Body() data: Prisma.UserCreateInput & Prisma.OwnerCreateInput,
  ) {
    try {
      return await this.ownerService.createOwner(data);
    } catch (error) {
      console.error('Controller error = ', error.message);

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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Patch('/:id/:ownerId')
  async updateOwner(
    @Body() data: Prisma.UserUpdateInput & Prisma.OwnerUpdateInput,
    @Param() { id, ownerId }: { id: string; ownerId: string },
  ) {
    try {
      return await this.ownerService.updateOwner({ data, id, ownerId });
    } catch (error) {
      console.error('Controller error = ', error);

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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Delete('/:id/:ownerId')
  async deleteOwner(@Param() { id, ownerId }: { id: string; ownerId: string }) {
    try {
      return await this.ownerService.deleteOwner({ id, ownerId });
    } catch (error) {
      console.error('Controller error = ', error);

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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
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
      console.error('Controller error = ', error);

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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Patch('/:id/:ownerId/block')
  async blockOnwer(
    @Param() { id, ownerId }: { id: string; ownerId: string },
    @Body() { justifications }: { justifications: Array<string> },
  ) {
    try {
      return await this.ownerService.blockOnwer({
        id,
        ownerId,
        justifications,
      });
    } catch (error) {
      console.error('Controller error = ', error);

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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ROLE.ADMIN, ROLE.ROOT)
  @Patch('/:id/:ownerId/allow')
  async allowOwner(@Param() { id, ownerId }: { id: string; ownerId: string }) {
    try {
      return await this.ownerService.allowOnwer({ id, ownerId });
    } catch (error) {
      console.error('Controller error = ', error);

      handleErrors(error);
    }
  }
}
