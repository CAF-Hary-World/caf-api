import { Injectable } from '@nestjs/common';
import {
  selectServicePermission,
  servicesPermissionsInMemory,
} from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServicePermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async listServicePermission({ userId }: { userId: string }) {
    const reference = `user-service-permission-${userId}`;
    try {
      if (!servicesPermissionsInMemory.hasItem(reference)) {
        const servicesPermission = await this.prisma.servicePermission.findMany(
          {
            where: {
              userId,
            },
            ...selectServicePermission,
          },
        );

        servicesPermissionsInMemory.storeExpiringItem(
          reference,
          servicesPermission,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return servicesPermissionsInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw error;
    }
  }
}
