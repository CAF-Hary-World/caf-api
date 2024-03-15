import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserController } from './user.controller';
import { VisitantService } from './resident/visitant/visitant.service';
import { VisitantController } from './resident/visitant/visitant.controller';
import { ResidentController } from './resident/resident.controller';
import { ResidentService } from './resident/resident.service';

@Module({
  controllers: [UserController, VisitantController, ResidentController],
  providers: [PrismaService, UserService, VisitantService, ResidentService],
  exports: [UserService],
})
export class UserModule {}
