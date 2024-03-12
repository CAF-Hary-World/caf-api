import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { encodeSha256 } from 'src/libs/bcrypt';
import { ownerInMemory, ownersInMemory } from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SignupService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOwner(data: Prisma.UserCreateInput & Prisma.OwnerCreateInput) {
    ownerInMemory.clear();
    ownersInMemory.clear();
    try {
      const ownerRoleId = (
        await this.prismaService.role.findUniqueOrThrow({
          where: { name: 'OWNER' },
        })
      ).id;
      const owner = await this.prismaService.user.create({
        data: {
          name: data.name,
          roleId: ownerRoleId,
          owner: {
            create: {
              cpf: data.cpf,
              email: data.email,
              house: data.house,
              square: data.square,
              phone: data.phone,
              password: encodeSha256(data.password),
            },
          },
        },
      });
      return owner;
    } catch (error) {
      throw new Error(error);
    }
  }
}
