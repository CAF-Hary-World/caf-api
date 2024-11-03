import { KIND, Prisma } from '@prisma/client';
import { selectService, serviceInMemory } from './../libs/memory-cache';
import { Injectable } from '@nestjs/common';
import { servicesInMemory } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetService, resetServicePermission } from 'src/utils/resetCache';
import { LogoService } from 'src/logo/logo.service';
import { ProviderService } from 'src/provider/provider.service';

@Injectable()
export class ServiceService {
  constructor(
    private prismaService: PrismaService,
    private logoService: LogoService,
    private providerService: ProviderService,
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
      resetService();
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
      resetService();
      return service;
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
        });
      resetService();
      resetServicePermission();
      return servicePermission;
    } catch (error) {
      throw error;
    }
  }

  async deleteServicePermission({ id }: { id: string }) {
    try {
      const servicePermission =
        await this.prismaService.servicePermission.delete({
          where: {
            id,
          },
        });
      resetService();

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
