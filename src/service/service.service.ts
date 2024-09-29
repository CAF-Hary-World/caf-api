import { selectService, serviceInMemory } from './../libs/memory-cache';
import { Injectable } from '@nestjs/common';
import { servicesInMemory } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
