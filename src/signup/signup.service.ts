import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { encodeSha256 } from 'src/libs/bcrypt';
import { ownerInMemory, ownersInMemory } from 'src/libs/memory-cache';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SignupService {
  constructor(
    private readonly prismaService: PrismaService,
    private mailService: MailService,
  ) {}

  async createOwner(data: Prisma.UserCreateInput & Prisma.OwnerCreateInput) {
    ownerInMemory.clear();
    ownersInMemory.clear();
    let ownerId: string;
    try {
      const owner = await this.prismaService.user.create({
        data: {
          name: data.name,
          available: {
            create: {
              status: 'PROCESSING',
              justifications: ['Aguardando confirmação do email'],
            },
          },
          role: {
            connect: {
              name: 'OWNER',
            },
          },
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
      ownerId = owner.id;
      await this.mailService.sendUserConfirmation({
        email: data.email,
        name: data.name,
        id: owner.id,
      });
      return owner;
    } catch (error) {
      await this.prismaService.user.delete({
        where: { id: ownerId },
      });
      throw new Error(error);
    }
  }
}
