import {
  residentInMemory,
  residentsInMemory,
  SelectResident,
  visitantsInMemory,
} from '../../../libs/memory-cache';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ownerInMemory,
  ownersInMemory,
  userInMemory,
  usersInMemory,
  visitantInMemory,
} from 'src/libs/memory-cache';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OwnerResidentService {
  private readonly selectScope = {
    name: true,
    available: true,
    id: true,
    role: { select: { name: true, id: true } },
    resident: {
      select: {
        id: true,
        cpf: true,
        email: true,
        phone: true,
        photo: true,
        visitants: true,
        owner: {
          select: {
            id: true,
            house: true,
            square: true,
          },
        },
      },
    },
  };

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

  constructor(
    private readonly prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async listResidents({
    id,
    ownerId,
    page = 1,
    name,
    cpf,
  }: {
    id: string;
    ownerId: string;
    page: number;
    name?: string;
    cpf?: string;
  }) {
    const reference = `user${id}-owner-${ownerId}-resident-${page}-${name}-${cpf}`;

    const perPage = process.env.DEFAULT_PER_PAGE
      ? Number(process.env.DEFAULT_PER_PAGE)
      : 10;

    const residentsCount = await this.prisma.resident.count({
      where: {
        ownerId,
        ...(name && { user: { name: { contains: name } } }),
        ...(cpf && { cpf: { contains: cpf } }),
      },
    });

    const totalPages = Math.ceil(residentsCount / perPage);

    try {
      if (!residentsInMemory.hasItem(reference)) {
        const residents = await this.prisma.resident.findMany({
          where: {
            ownerId,
            ...(name && { user: { name: { contains: name } } }),
            ...(cpf && { cpf: { contains: cpf } }),
          },
          orderBy: { user: { name: 'desc' } },
          skip: (page - 1) * perPage,
          take: perPage,
          select: {
            id: true,
            cpf: true,
            email: true,
            phone: true,
            photo: true,
            visitants: true,
            owner: { select: { id: true, house: true, square: true } },
            user: {
              select: {
                name: true,
                available: true,
                id: true,
                role: true,
              },
            },
          },
        });

        console.log(residents);

        const residentSerialized: Array<Prisma.UserGetPayload<SelectResident>> =
          residents.map((resident) => ({
            name: resident.user.name,
            available: resident.user.available,
            id: resident.user.id,
            role: resident.user.role,
            resident: { ...resident },
          }));

        residentsInMemory.storeExpiringItem(
          reference,
          residentSerialized,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return {
        resource: residentsInMemory.retrieveItemValue(reference),
        totalPages,
      };
    } catch (error) {
      console.log('Residente List Service =', error);

      throw new Error(error);
    }
  }

  async createResident({
    user,
    ownerId,
  }: {
    user: Prisma.UserCreateInput & { resident: Prisma.ResidentCreateInput };
    ownerId: string;
  }) {
    this.resetCache();
    let residentId: string;

    try {
      const owner = await this.prisma.owner.findUnique({
        where: {
          id: ownerId,
        },
        select: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      const resident = await this.prisma.user.create({
        data: {
          name: user.name,
          available: {
            create: {
              status: 'PROCESSING',
              justifications: ['Aguardando confirmação do email'],
            },
          },
          role: {
            connect: {
              name: 'RESIDENT',
            },
          },
          resident: {
            create: {
              ...user.resident,
              password: '123123123',
              owner: {
                connect: {
                  id: ownerId,
                },
              },
            },
          },
        },
      });
      residentId = resident.id;
      await this.mailService.sendResidentConfirmation({
        recipient: {
          email: user.resident.email,
          name: user.name,
          id: residentId,
        },
        sender: {
          name: owner.user.name,
        },
      });
      return resident;
    } catch (error) {
      console.log('Residente Create Service = ', error);
      await this.prisma.user.delete({
        where: { id: residentId },
      });
      throw new Error(error);
    }
  }

  async removeResident({
    cpf,
    id,
    ownerId,
  }: {
    id: string;
    ownerId: string;
    cpf: string;
  }) {
    this.resetCache();
    try {
      return await this.prisma.user.delete({
        where: {
          id,
          resident: {
            cpf,
            owner: {
              id: ownerId,
            },
          },
        },
      });
    } catch (error) {
      console.log('Residente Create Service = ', error);

      throw new Error(error);
    }
  }

  async updateResident({
    id,
    residentId,
    ownerId,
    user,
  }: {
    id: string;
    residentId: string;
    ownerId: string;
    user: Prisma.UserUpdateInput & { resident: Prisma.ResidentUpdateInput };
  }) {
    this.resetCache();
    console.log('update resident');

    try {
      //  IF resident belongs to owner
      await this.prisma.user.findUniqueOrThrow({
        where: {
          id,
          resident: {
            id: residentId,
            ownerId,
          },
        },
      });

      await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          name: user.name,
          resident: {
            update: {
              cpf: user.resident.cpf,
              email: user.resident.email,
              phone: user.resident.phone,
            },
          },
        },
      });
    } catch (error) {
      console.log('Residente Update Service = ', error);

      throw new Error(error);
    }
  }
}
