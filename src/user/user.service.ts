import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async confirmation(id: string) {
    try {
      const user = await this.prisma.user.findFirstOrThrow({
        where: { id },
        include: { available: true },
      });
      if (user.available.status === 'ALLOWED')
        throw new Error('User already available');
      return await this.prisma.user.update({
        where: { id },
        data: {
          available: {
            update: {
              status: 'ALLOWED',
              justifications: [],
            },
          },
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }
}
