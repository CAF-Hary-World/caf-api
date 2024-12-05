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
import { OwnerResidentController } from './owner/resident/resident.controller';
import { OwnerResidentService } from './owner/resident/resident.service';
import { MailModule } from 'src/mail/mail.module';
import { PermissionController } from './permission/permission.controller';
import { PermissionService } from './permission/permission.service';
import { NotificationService } from 'src/notification/notification.service';
import { ServicePermissionController } from './service/permission/permission.controller';
import { ServicePermissionService } from './service/permission/permission.service';
import { ParcelController } from './parcel/parcel.controller';
import { ParcelService } from './parcel/parcel.service';

@Module({
  controllers: [
    UserController,
    ResidentVisitantController,
    OwnerVisitantController,
    PermissionController,
    OwnerResidentController,
    ResidentController,
    OwnerController,
    ServicePermissionController,
    ParcelController,
  ],
  providers: [
    PrismaService,
    UserService,
    NotificationService,
    ResidentVisitantService,
    OwnerVisitantService,
    PermissionService,
    OwnerResidentService,
    ResidentService,
    OwnerService,
    ServicePermissionService,
    ParcelService,
  ],
  imports: [MailModule],
  exports: [UserService],
})
export class UserModule {}
