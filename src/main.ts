import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RolesGuard } from './guards/role.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  }); /* to make it throw an error instead of exit with the code 1 */
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: [
      String(process.env.COND_URL),
      String(process.env.ADMIN_URL),
      String(process.env.SECURITY_URL),
    ],
  });
  await app.listen(Number(process.env.PORT) || 3000, () => {
    console.log('RUNNING IN PORT = ', Number(process.env.PORT) || 3000);
  });
}
bootstrap();
