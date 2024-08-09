import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignupService } from './signup/signup.service';
import { SignupController } from './signup/signup.controller';
import { PrismaService } from './prisma/prisma.service';
import { Seed } from './utils/seed';
import { MailModule } from './mail/mail.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { VisitantService } from './visitant/visitant.service';
import { VisitantController } from './visitant/visitant.controller';
import { JustificationController } from './justification/justification.controller';
import { JustificationService } from './justification/justification.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks/tasks.service';
import { NotificationService } from './notification/notification.service';
import { NotificationController } from './notification/notification.controller';

@Module({
  imports: [
    UserModule,
    AuthModule,
    MailModule,
    RoleModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AppController,
    SignupController,
    UserController,
    VisitantController,
    JustificationController,
    NotificationController,
  ],
  providers: [
    AppService,
    SignupService,
    PrismaService,
    VisitantService,
    JustificationService,
    TasksService,
    NotificationService,
  ],
})
export class AppModule {
  constructor(private readonly prismaService: PrismaService) {
    this.runSeeds();
  }
  async runSeeds() {
    const seed = new Seed(this.prismaService);
    await seed.createDefaultRoles();
    await Promise.all([
      seed.createDefaultJustifications(),
      seed.createRootUser(),
    ]);
  }
}
