import { Injectable } from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetUsers } from 'src/utils/resetCache';
import { timeStampISOTime } from 'src/utils/time';

@Injectable()
export class PermissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create({ userId, visitantId }: { userId: string; visitantId: string }) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { name: true },
      });
      const visitant = await this.prisma.visitant.findUniqueOrThrow({
        where: { id: visitantId },
        select: { name: true },
      });

      await this.prisma.permission.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          visitant: {
            connect: {
              id: visitantId,
            },
          },
        },
      });

      resetUsers();

      return await this.notificationService.sendsPushesByRole({
        roles: ['ADMIN', 'SECURITY', 'ROOT'],
        body: `O morador ${user.name} convidou ${visitant.name}`,
        title: 'Permissão de entrada enviada!',
        path: `/permissions/${visitantId}`,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateCheckin({ visitantId }: { visitantId: string }) {
    try {
      const permissions = await this.prisma.permission.findMany({
        where: {
          visitant: {
            id: visitantId,
          },
          deletedAt: null,
          checkin: null,
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
          visitant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      console.log(permissions);

      await this.prisma.permission.updateMany({
        where: {
          visitant: {
            id: visitantId,
          },
          deletedAt: null,
          checkin: null,
        },
        data: {
          checkin: timeStampISOTime,
          updatedAt: timeStampISOTime,
        },
      });

      permissions.forEach(async (permission) => {
        await this.notificationService.sendPushToUser({
          userId: permission.user.id,
          body: `A portaria já liberou a entrada.`,
          title: `${permission.visitant.name} chegou.`,
          role: permission.user.role.name,
        });
      });

      return resetUsers();
    } catch (error) {
      throw error;
    }
  }

  async updateCheckout({ visitantId }: { visitantId: string }) {
    console.log('visitantId = ', visitantId);

    try {
      const permissions = await this.prisma.permission.findMany({
        where: {
          visitant: {
            id: visitantId,
          },
          deletedAt: null,
          checkin: { not: null },
          checkout: null,
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
          visitant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      await this.prisma.permission.updateMany({
        where: {
          visitant: {
            id: visitantId,
          },
          deletedAt: null,
          checkin: { not: null },
          checkout: null,
        },
        data: {
          checkout: timeStampISOTime,
          updatedAt: timeStampISOTime,
          deletedAt: timeStampISOTime,
        },
      });

      permissions.forEach(async (permission) => {
        await this.notificationService.sendPushToUser({
          userId: permission.user.id,
          body: `Saida confirmada.`,
          title: `${permission.visitant.name} saiu do ${process.env.CLIENT_NAME} com segurança.`,
          role: permission.user.role.name,
        });
      });

      return resetUsers();
    } catch (error) {
      throw error;
    }
  }
}
