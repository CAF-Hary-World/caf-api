import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async confirmation(id: string) {
    try {
      const user = await this.prisma.user.findFirstOrThrow({
        where: { id },
        include: {
          available: {
            include: {
              justifications: {
                include: {
                  justification: {
                    select: {
                      id: true,
                      description: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (user.available.status === 'ALLOWED')
        throw new Error('User already available');
      return await this.prisma.user.update({
        where: { id },
        data: {
          available: {
            update: {
              justifications: {
                delete: {
                  availableId: user.available.id,
                  availableId_justificationId: {
                    availableId: user.available.id,
                    justificationId: user.available.justifications.find(
                      (justification) => {
                        return (
                          justification.justification.description ===
                          'Aguardando confirmação do email'
                        );
                      },
                    ).justification.id,
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }
}
