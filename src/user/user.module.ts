import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserController } from './user.controller';
import { ResidentVisitantService } from './resident/visitant/visitant.service';
import { ResidentVisitantController } from './resident/visitant/visitant.controller';
import { ResidentController } from './resident/resident.controller';
import { ResidentService } from './resident/resident.service';
import { OwnerService } from './owner/owner.service';
import { OwnerController } from './owner/owner.controller';
import { OwnerVisitantController } from './owner/visitant/visitant.controller';
import { OwnerVisitantService } from './owner/visitant/visitant.service';

@Module({
  controllers: [
    UserController,
    ResidentVisitantController,
    OwnerVisitantController,
    ResidentController,
    OwnerController,
  ],
  providers: [
    PrismaService,
    UserService,
    ResidentVisitantService,
    OwnerVisitantService,
    ResidentService,
    OwnerService,
  ],
  exports: [UserService],
})
export class UserModule {}
