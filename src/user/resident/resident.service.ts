import { Injectable } from '@nestjs/common';
import { encodeSha256 } from 'src/libs/bcrypt';
import {
  ownerInMemory,
  ownersInMemory,
  residentInMemory,
  residentsInMemory,
  userInMemory,
  usersInMemory,
  visitantInMemory,
  visitantsInMemory,
} from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResidentService {
  private resetCache() {
    userInMemory.clear();
    usersInMemory.clear();
    ownerInMemory.clear();
    ownersInMemory.clear();
    visitantInMemory.clear();
    visitantsInMemory.clear();
    residentsInMemory.clear();
    residentInMemory.clear();
  }

  constructor(private readonly prisma: PrismaService) {}

  async belongsToOwner(id: string) {
    try {
      await this.prisma.user.findFirstOrThrow({ where: { id } });
      await this.prisma.resident.findFirstOrThrow({
        where: {
          userId: id,
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async confirmation({ id, password }: { id: string; password: string }) {
    this.resetCache();
    try {
      const user = await this.prisma.user.findFirstOrThrow({
        where: { id },
        include: { available: true },
      });
      if (user.available) throw new Error('User already available');
      return await this.prisma.user.update({
        where: { id },
        data: {
          available: {
            update: {
              status: 'ALLOWED',
              justifications: {
                deleteMany: {
                  availableId: user.availableId,
                },
              },
            },
          },
          resident: {
            update: {
              password: encodeSha256(password),
            },
          },
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }
}
