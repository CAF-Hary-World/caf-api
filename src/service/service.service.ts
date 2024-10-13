import { Prisma } from '@prisma/client';
import { selectService, serviceInMemory } from './../libs/memory-cache';
import { Injectable } from '@nestjs/common';
import { servicesInMemory } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetService } from 'src/utils/resetCache';

@Injectable()
export class ServiceService {
  constructor(private prismaService: PrismaService) {}

  async listServices({ page = 1, name }: { page: number; name?: string }) {
    const reference = `service-${page}-${name}`;

    const perPage =
      process.env.NODE_ENV === 'development'
        ? 2
        : Number(process.env.DEFAULT_PER_PAGE);

    let totalPages = 1;

    try {
      if (!servicesInMemory.hasItem(reference)) {
        const [servicesCount, services] = await Promise.all([
          this.prismaService.service.count({
            where: {
              ...(name && { name: { contains: name, mode: 'insensitive' } }),
            },
          }),
          this.prismaService.user.findMany({
            where: {
              role: {
                name: 'OWNER',
              },
              ...(name && { name: { contains: name, mode: 'insensitive' } }),
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * perPage,
            take: perPage,
            ...selectService,
          }),
        ]);

        totalPages = Math.ceil(servicesCount / perPage);

        servicesInMemory.storeExpiringItem(
          reference,
          services,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }

      return {
        resource: servicesInMemory.retrieveItemValue(reference),
        totalPages,
      };
    } catch (error) {
      throw error;
    }
  }

  async getService({ id }: { id: string }) {
    const reference = `service-${id}`;

    try {
      if (!serviceInMemory.hasItem(reference)) {
        const service = await this.prismaService.service.findUniqueOrThrow({
          where: { id },
          ...selectService,
        });

        serviceInMemory.storeExpiringItem(
          reference,
          service,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return serviceInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw error;
    }
  }

  async deleteService({ id }: { id: string }) {
    try {
      const service = await this.prismaService.service.delete({
        where: { id },
      });
      return service;
    } catch (error) {
      throw error;
    }
  }

  async deleteManyService({ ids }: { ids: Array<string> }) {
    try {
      const service = await this.prismaService.service.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return service;
    } catch (error) {
      throw error;
    }
  }

  async createService(data: Prisma.ServiceCreateInput) {
    try {
      const service = await this.prismaService.service.create({
        data,
      });
      resetService();

      return service;
    } catch (error) {
      throw error;
    }
  }

  async updateService({ id, ...data }: Prisma.ServiceUpdateInput) {
    try {
      const service = await this.prismaService.service.update({
        where: {
          id: String(id),
        },
        data,
      });
      resetService();

      return service;
    } catch (error) {
      throw error;
    }
  }

  async createServicePermission({
    userId,
    serviceId,
    providerId,
  }: {
    userId: string;
    serviceId: string;
    providerId?: string;
  }) {
    try {
      const servicePermission =
        await this.prismaService.servicePermission.create({
          data: {
            user: {
              connect: {
                id: userId,
              },
            },
            service: {
              connect: {
                id: serviceId,
              },
            },
            ...(providerId && {
              provider: {
                connect: {
                  id: providerId,
                },
              },
            }),
          },
        });
      resetService();

      return servicePermission;
    } catch (error) {
      throw error;
    }
  }
}
