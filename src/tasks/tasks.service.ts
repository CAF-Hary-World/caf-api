import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetUsers } from 'src/utils/resetCache';

@Injectable()
export class TasksService {
  private resetCache = resetUsers;
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_30_MINUTES_BETWEEN_9AM_AND_6PM, {
    name: 'restoreAvailableJustificationOfOwnerInvited',
    timeZone: 'UTC',
  })
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
      this.resetCache();
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
