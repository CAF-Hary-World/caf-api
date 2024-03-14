import { Injectable } from '@nestjs/common';
import { ROLE } from '@prisma/client';
import { roleInMemory, rolesInMemory } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private readonly prismaService: PrismaService) {}

  async list() {
    const reference = 'roles';
    try {
      if (!rolesInMemory.hasItem(reference)) {
        rolesInMemory.storeExpiringItem(
          reference,
          await this.prismaService.role.findMany(),
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return rolesInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw new Error(error);
    }
  }

  async getRoleByName(name: ROLE) {
    const reference = `role-${name}`;
    try {
      if (!roleInMemory.hasItem(reference)) {
        roleInMemory.storeExpiringItem(
          reference,
          await this.prismaService.role.findUniqueOrThrow({ where: { name } }),
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return roleInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw new Error(error);
    }
  }

  async findRole(id: string) {
    const reference = `role-${id}`;
    try {
      if (!roleInMemory.hasItem(reference)) {
        roleInMemory.storeExpiringItem(
          reference,
          await this.prismaService.role.findUniqueOrThrow({ where: { id } }),
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return roleInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw new Error(error);
    }
  }
}
