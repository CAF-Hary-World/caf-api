import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SignupService } from './signup.service';
import { Prisma } from '@prisma/client';

@Controller('signup')
export class SignupController {
  constructor(private readonly signUpService: SignupService) {}

  @Post('')
  @HttpCode(204)
  async signup(
    @Body()
    data: Prisma.UserCreateInput & Prisma.OwnerCreateInput,
  ) {
    try {
      await this.signUpService.createOwner(data);
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
