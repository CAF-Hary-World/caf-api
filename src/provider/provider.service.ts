import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  providerInMemory,
  providersInMemory,
  selectProvider,
} from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetProvider } from 'src/utils/resetCache';

@Injectable()
export class ProviderService {
  constructor(private prismaService: PrismaService) {}

  async listProviders({ page = 1, name }: { page: number; name?: string }) {
    const reference = `provider-${page}-${name}`;

    const perPage =
      process.env.NODE_ENV === 'development'
        ? 2
        : Number(process.env.DEFAULT_PER_PAGE);

    let totalPages = 1;

    try {
      if (!providersInMemory.hasItem(reference)) {
        const [providersCount, providers] = await Promise.all([
          this.prismaService.provider.count({
            where: {
              ...(name && { name: { contains: name, mode: 'insensitive' } }),
            },
          }),
          this.prismaService.provider.findMany({
            where: {
              ...(name && { name: { contains: name, mode: 'insensitive' } }),
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * perPage,
            take: perPage,
            ...selectProvider,
          }),
        ]);

        totalPages = Math.ceil(providersCount / perPage);

        providersInMemory.storeExpiringItem(
          reference,
          providers,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }

      return {
        resource: providersInMemory.retrieveItemValue(reference),
        totalPages,
      };
    } catch (error) {
      throw error;
    }
  }

  async getProvider({ id }: { id: string }) {
    const reference = `provider-${id}`;

    try {
      if (!providerInMemory.hasItem(reference)) {
        const provider = await this.prismaService.provider.findUniqueOrThrow({
          where: { id },
          ...selectProvider,
        });

        providerInMemory.storeExpiringItem(
          reference,
          provider,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return providerInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw error;
    }
  }

  async deleteProvider({ id }: { id: string }) {
    try {
      const provider = await this.prismaService.provider.delete({
        where: { id },
      });
      resetProvider();
      return provider;
    } catch (error) {
      throw error;
    }
  }

  async deleteManyProvider({ ids }: { ids: Array<string> }) {
    try {
      const provider = await this.prismaService.provider.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      resetProvider();
      return provider;
    } catch (error) {
      throw error;
    }
  }

  async createProvider(data: Prisma.ProviderCreateInput) {
    try {
      const provider = await this.prismaService.provider.create({
        data,
      });
      resetProvider();
      return provider;
    } catch (error) {
      throw error;
    }
  }

  async updateProvider({ id, ...data }: Prisma.ProviderUpdateInput) {
    try {
      const provider = await this.prismaService.provider.update({
        where: {
          id: String(id),
        },
        data,
      });
      resetProvider();
      return provider;
    } catch (error) {
      throw error;
    }
  }
}
