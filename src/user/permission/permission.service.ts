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
      const [permissions] = await Promise.all([
        this.prisma.permission.findMany({
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
        }),
        this.prisma.permission.updateMany({
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
        }),
      ]);

      await Promise.all(
        permissions.map(async (permission) =>
          this.notificationService.sendPushToUser({
            userId: permission.user.id,
            title: `Visitante chegou`,
            body: `${permission.visitant.name} passou pela portaria e esta a caminho da sua casa.`,
            role: permission.user.role.name,
          }),
        ),
      );

      return resetUsers();
    } catch (error) {
      throw error;
    }
  }

  async updateCheckout({ visitantId }: { visitantId: string }) {
    try {
      const [permissions] = await Promise.all([
        this.prisma.permission.findMany({
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
        }),
        this.prisma.permission.updateMany({
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
        }),
      ]);

      await Promise.all(
        permissions.map(async (permission) =>
          this.notificationService.sendPushToUser({
            userId: permission.user.id,
            title: `Saida confirmada.`,
            body: `${permission.visitant.name} saiu do ${process.env.CLIENT_NAME} com segurança.`,
            role: permission.user.role.name,
          }),
        ),
      );

      return resetUsers();
    } catch (error) {
      throw error;
    }
  }
}
