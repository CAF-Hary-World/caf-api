import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { encodeSha256 } from 'src/libs/bcrypt';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { resetUsers } from 'src/utils/resetCache';
import { timeStampISOTime } from 'src/utils/time';

@Injectable()
export class SignupService {
  private resetCache = resetUsers;

  constructor(
    private readonly prismaService: PrismaService,
    private mailService: MailService,
  ) {}

  async activatedOwner({
    data,
  }: {
    data: Prisma.UserUpdateInput & Prisma.OwnerUpdateInput;
  }) {
    this.resetCache();
    try {
      const userOwner = await this.prismaService.user.findUniqueOrThrow({
        where: {
          id: String(data.id),
          owner: {
            id: String(data.ownerId),
          },
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

      await Promise.all([
        this.prismaService.user.update({
          where: {
            id: String(data.id),
            owner: {
              id: String(data.ownerId),
            },
          },
          data: {
            ...(userOwner.name !== data.name && {
              name: data.name,
              updatedAt: timeStampISOTime,
            }),
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
                updatedAt: timeStampISOTime,
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
        }),
        this.mailService.sendUserValidation({
          email: userOwner.owner.email,
          name: userOwner.name,
        }),
      ]);
    } catch (error) {
      throw error;
    }
  }

  async activatedResident({
    name,
    cpf,
    email,
    id,
    residentId,
    phone,
    password,
  }: Prisma.UserUpdateInput & Prisma.ResidentUpdateInput) {
    try {
      await Promise.all([
        this.prismaService.user.update({
          where: {
            id: String(id),
            resident: {
              id: String(residentId),
            },
          },
          data: {
            ...(name && { name }),
            available: {
              update: {
                status: 'ALLOWED',
              },
            },
            resident: {
              update: {
                ...(phone && { phone }),
                ...(cpf && { cpf }),
                ...(email && { email }),
                password: encodeSha256(String(password)),
              },
            },
          },
        }),
        this.prismaService.availablesJustifications.deleteMany({
          where: {
            availabe: {
              userId: String(id),
            },
          },
        }),
      ]);
    } catch (error) {
      throw error;
    }
  }
}
