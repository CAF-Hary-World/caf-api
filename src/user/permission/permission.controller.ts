import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionService } from './permission.service';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';

// Define CustomRequest interface extending the Express Request
interface CustomRequest extends ExpressRequest {
  user: {
    id: string;
  };
}

@Controller('users/permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() data: { visitantId: string },
    @Request() req: CustomRequest,
  ) {
    const userId = req.user.id;
    try {
      return await this.permissionService.create({
        userId,
        visitantId: data.visitantId,
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

  @UseGuards(AuthGuard)
  @Patch('/sign-in')
  async checkin(@Body() data: { visitantId: string }) {
    const { visitantId } = data;
    try {
      return await this.permissionService.updateCheckin({
        visitantId,
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

  @UseGuards(AuthGuard)
  @Patch('/sign-out')
  async checkout(@Body() data: { visitantId: string }) {
    const { visitantId } = data;
    try {
      return await this.permissionService.updateCheckout({
        visitantId,
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
}
