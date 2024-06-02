import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Patch,
  Query,
} from '@nestjs/common';
import { SignupService } from './signup.service';
import { Prisma } from '@prisma/client';

@Controller('signup')
export class SignupController {
  constructor(private readonly signUpService: SignupService) {}

  @Patch()
  @HttpCode(204)
  async signup(
    @Body()
    data: Prisma.UserUpdateInput & Prisma.OwnerUpdateInput,
    @Query() id: string,
  ) {
    try {
      await this.signUpService.activatedOwner({ data, id });
      return;
    } catch (error) {
      console.log(error);

      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          error: error.message,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
        {
          cause: error,
        },
      );
    }
  }
}
