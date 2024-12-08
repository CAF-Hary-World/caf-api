import { KIND, Prisma } from '@prisma/client';
import { selectService, serviceInMemory } from './../libs/memory-cache';
import { Injectable } from '@nestjs/common';
import { servicesInMemory } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetService, resetServicePermission } from 'src/utils/resetCache';
import { LogoService } from 'src/logo/logo.service';
import { ProviderService } from 'src/provider/provider.service';
import { NotificationService } from 'src/notification/notification.service';
import { deleteImageByUrl, deleteImagesByUrl } from 'src/utils/images';

@Injectable()
export class ServiceService {
  constructor(
    private prismaService: PrismaService,
    private logoService: LogoService,
    private providerService: ProviderService,
    private readonly notificationService: NotificationService,
  ) {}

  async listServices({ page = 1, name }: { page: number; name?: string }) {
    const reference = `service-${page}-${name}`;

    const perPage =
      process.env.NODE_ENV === 'development'
        ? 2
        : Number(process.env.DEFAULT_PER_PAGE);

    let totalPages = 1;

    try {
      const servicesCount = await this.prismaService.service.count({
        where: {
          ...(name && { name: { contains: name, mode: 'insensitive' } }),
        },
      });
      totalPages = Math.ceil(servicesCount / perPage);

      if (!servicesInMemory.hasItem(reference)) {
        const services = await this.prismaService.service.findMany({
          where: {
            ...(name && { name: { contains: name, mode: 'insensitive' } }),
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
          ...selectService,
        });

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

      if (service.logo)
        await deleteImageByUrl({
          imageUrl: service.logo,
          location: 'Avatar',
          resource: 'Services',
        });

      resetService();
      return service;
    } catch (error) {
      throw error;
    }
  }

  async deleteManyService({ ids }: { ids: Array<string> }) {
    try {
      const [services] = await Promise.all([
        this.prismaService.service.findMany({
          where: {
            AND: [
              {
                id: {
                  in: ids,
                },
                logo: { not: null },
              },
            ],
          },
        }),
        this.prismaService.service.deleteMany({
          where: {
            id: {
              in: ids,
            },
          },
        }),
      ]);

      if (services.length > 0) {
        const imageUrls = services.map((service) => service.logo);
        await deleteImagesByUrl({
          imageUrls,
          location: 'Avatar',
          resource: 'Services',
        });
      }

      resetService();
      return services;
    } catch (error) {
      throw error;
    }
  }

  async createService(data: Prisma.ServiceCreateInput) {
    const logo = await this.logoService.getLogo({ name: data.name });

    try {
      const service = await this.prismaService.service.create({
        data: { ...data, ...(logo && { logo }) },
      });
      resetService();
      return service;
    } catch (error) {
      throw error;
    }
  }

  async updateService({ id, ...data }: Prisma.ServiceUpdateInput) {
    try {
      const [service] = await Promise.all([
        this.prismaService.service.findUnique({
          where: {
            id: String(id),
          },
        }),
        this.prismaService.service.update({
          where: {
            id: String(id),
          },
          data,
        }),
      ]);

      if (service && service.logo)
        await deleteImageByUrl({
          imageUrl: service.logo,
          location: 'Avatar',
          resource: 'Services',
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
    provider,
  }: {
    userId: string;
    serviceId: string;
    provider?: {
      name: string;
      kind: KIND;
      plate?: string;
      document: string;
    };
  }) {
    try {
      if (Boolean(provider)) {
        const providerByDatabase = await this.providerService.getProviderByName(
          {
            name: provider.name,
          },
        );

        if (Boolean(providerByDatabase)) {
          await this.providerService.createProvider({ ...provider });
        }
      }

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
            ...(provider && {
              provider: {
                connect: {
                  name: provider.name,
                },
              },
            }),
          },
          select: {
            service: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                name: true,
              },
            },
          },
        });
      resetService();
      resetServicePermission();
      return await this.notificationService.sendsPushesByRole({
        roles: ['ADMIN', 'SECURITY', 'ROOT'],
        body: `O morador ${servicePermission.user.name} liberou a entrada do serviço ${servicePermission.service.name}.`,
        title: 'Permissão de entrada de serviço enviada!',
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteServicePermission({
    id,
    serviceId,
  }: {
    id: string;
    serviceId: string;
  }) {
    try {
      const servicePermission =
        await this.prismaService.servicePermission.delete({
          where: {
            id,
            service: {
              id: serviceId,
            },
          },
        });
      resetService();
      resetServicePermission();
      return servicePermission;
    } catch (error) {
      throw error;
    }
  }

  async deleteManyServicePermission({ ids }: { ids: Array<string> }) {
    try {
      const servicePermission =
        await this.prismaService.servicePermission.deleteMany({
          where: {
            id: {
              in: ids,
            },
          },
        });
      resetService();

      return servicePermission;
    } catch (error) {
      throw error;
    }
  }
}
