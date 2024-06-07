import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './auth.dto';

@Controller('auth/sign-in')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('cond')
  async singInCond(@Body() signIn: SignInDto) {
    try {
      return await this.authService.signInOwnerOrResident({
        email: signIn.email,
        password: signIn.password,
      });
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

  @HttpCode(HttpStatus.OK)
  @Post('admin')
  async singInAdmin(@Body() signIn: SignInDto) {
    try {
      return await this.authService.signInAdmin({
        email: signIn.email,
        password: signIn.password,
      });
    } catch (error) {
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
