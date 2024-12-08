import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { handleErrors } from 'src/handles/errors';
import { AuthGuard } from 'src/auth/auth.guard';
import { ROLE } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listUsers(
    @Query()
    {
      page,
      name,
      house,
      square,
      roles,
    }: {
      page: number;
      name?: string;
      house?: string;
      square?: string;
      roles: Array<ROLE>;
    },
  ) {
    try {
      const residents = await this.userService.listUsers({
        page,
        name,
        house,
        square,
        roles,
      });
      return residents;
    } catch (error) {
      handleErrors(error);
    }
  }

  @Patch('/confirmation')
  @HttpCode(204)
  async confirmationUser(@Body() data: { id: string }) {
    try {
      await this.userService.confirmation(data.id);
      return;
    } catch (error) {
      handleErrors(error);
    }
  }
}
