import { Injectable } from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetPermissions, resetUsers } from 'src/utils/resetCache';

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

      await this.notificationService.sendsPushesByRole({
        roles: ['ADMIN', 'SECURITY', 'ROOT'],
        body: `O morador ${user.name} convidou ${visitant.name}`,
        title: 'Permissão de entrada enviada!',
        path: '/permissions',
      });

      resetPermissions();
      resetUsers();

      return await this.prisma.permission.create({
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
    } catch (error) {
      throw error;
    }
  }
}
