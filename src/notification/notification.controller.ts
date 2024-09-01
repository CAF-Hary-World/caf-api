import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from 'src/auth/auth.guard';
import { NotificationService } from './notification.service';
import { ROLE } from '@prisma/client';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthGuard)
  @Post()
  async acceptedNotification(
    @Body() { userId, token }: { userId: string; token: string },
  ) {
    try {
      return await this.notificationService.acceptPushNotification({
        token,
        userId,
      });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
        {
          cause: error,
        },
      );
    }
  }

  @Post('/send')
  async sendNotification() {}

  @Post('role/send/:roleName')
  async sendRoleNotification(
    @Body()
    { title, body }: { title: string; body: string },
    @Param() { roleName }: { roleName: ROLE },
  ) {
    try {
      await this.notificationService.sendPushByRole({
        body,
        role: roleName,
        title,
      });
    } catch (error) {
      throw error;
    }
  }

  @Post('address/send/:id')
  async sendAddressNotification() {}
}
