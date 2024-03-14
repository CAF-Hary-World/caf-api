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

@Module({
  imports: [UserModule, AuthModule, MailModule, RoleModule],
  controllers: [AppController, SignupController, UserController],
  providers: [AppService, SignupService, PrismaService],
})
export class AppModule {
  constructor(private readonly prismaService: PrismaService) {
    this.runSeeds();
  }
  async runSeeds() {
    const seed = new Seed(this.prismaService);
    await seed.createDefaultRoles();
  }
}
