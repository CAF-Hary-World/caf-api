import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { encodeSha256 } from 'src/libs/bcrypt';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetUsers } from 'src/utils/resetCache';

@Injectable()
export class SignupService {
  private resetCache = resetUsers;

  constructor(
    private readonly prismaService: PrismaService,
    private mailService: MailService,
  ) {}

  async activatedOwner({
    data,
    id,
  }: {
    data: Prisma.UserUpdateInput & Prisma.OwnerUpdateInput;
    id: string;
  }) {
    this.resetCache();
    try {
      const userOwner = await this.prismaService.user.findUniqueOrThrow({
        where: {
          id,
          available: {
            status: 'PROCESSING',
          },
        },
        include: {
          owner: true,
          available: {
            include: {
              justifications: true,
            },
          },
        },
      });

      await this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          ...(userOwner.name !== data.name && { name: data.name }),
          owner: {
            update: {
              ...(userOwner.owner.cpf !== data.cpf && { cpf: data.cpf }),
              ...(userOwner.owner.email !== data.email && {
                email: data.email,
              }),
              ...(userOwner.owner.phone !== data.phone && {
                phone: data.phone,
              }),
              ...(userOwner.owner.photo !== data.photo && {
                photo: data.photo,
              }),
              ...(userOwner.owner.house !== data.house && {
                house: data.house,
              }),
              ...(userOwner.owner.square !== data.square && {
                square: data.square,
              }),
              password: encodeSha256(String(data.password)),
            },
          },
          available: {
            update: {
              status: 'ALLOWED',
              justifications: {
                deleteMany: {
                  availableId: userOwner.available.id,
                },
              },
            },
          },
        },
        include: {
          available: true,
        },
      });

      await this.mailService.sendUserValidation({
        email: userOwner.owner.email,
        name: userOwner.name,
      });
    } catch (error) {
      throw error;
    }
  }
}
