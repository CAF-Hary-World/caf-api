import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}
  // Define the cron job with a dynamic schedule
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
  //   name: 'restoreAvailableJustificationOfOwnerInvited',
  //   timeZone: 'UTC',
  // })
  @Cron(process.env.NODE_ENV !== 'production' ? '*/50 * * * * *' : '* 1 * * *')
  async handleCron() {
    this.logger.debug('Called restoreAvailableJustificationOfOwnerInvited');
    const availablesJustifications =
      await this.prisma.availablesJustifications.findMany({
        where: {
          justification: {
            description: 'Aguardando confirmação do email',
          },
        },
      });

    if (availablesJustifications.length > 0) {
      const justificationToAllowInvite =
        await this.prisma.justification.findUniqueOrThrow({
          where: {
            description: 'Aguardando convite da administração',
          },
        });

      await this.prisma.availablesJustifications.updateMany({
        where: {
          availableId: {
            in: availablesJustifications.map(
              (availablesJustification) => availablesJustification.availableId,
            ),
          },
        },
        data: {
          justificationId: justificationToAllowInvite.id,
        },
      });
    }
  }
}
