import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import cloudinary from 'cloudinary';

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
  async handleRestoreAvailableJustificationOfOwnerInvited() {
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'restoreAvailableJustificationOfOwnerInvited',
    timeZone: 'UTC',
  })
  async handleDeleteTempImagesOfCloudinary() {
    this.logger.debug('Called handleDeleteTempImagesOfCloudinary');
    try {
      await cloudinary.v2.api.delete_resources_by_prefix('samples/');
      this.logger.debug('samples destoyed');
    } catch (error) {
      this.logger.debug(`Error (handleDeleteTempImagesOfCloudinary) ${error}`);
      throw error;
    }
  }
}
