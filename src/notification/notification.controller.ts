import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

import { AuthGuard } from 'src/auth/auth.guard';
import { NotificationService } from './notification.service';
import { ROLE } from '@prisma/client';

// Define CustomRequest interface extending the Express Request
interface CustomRequest extends ExpressRequest {
  user: {
    id: string;
  };
}

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getNotifications(@Request() req: CustomRequest) {
    try {
      const userId = req.user.id;
      return await this.notificationService.getUserNotifications({ userId });
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
