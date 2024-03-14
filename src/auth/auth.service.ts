import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Owner, Resident, Role, User } from '@prisma/client';
import { compare } from 'src/libs/bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

type ISignIn = Pick<User, 'id' | 'name'> & {
  role: Pick<Role, 'id' | 'name'>;
} & {
  resident?: Pick<Resident, 'id' | 'email' | 'phone' | 'photo'> & {
    owner: Pick<Owner, 'id' | 'house' | 'square'>;
  };
  owner?: Pick<Owner, 'id' | 'house' | 'square' | 'phone' | 'photo' | 'email'>;
};
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signIn({ email, password }: { email: string; password: string }) {
    try {
      const user: ISignIn = await this.findOwnerOrResident({
        email,
        pass: password,
      });

      const payload = { email, id: user.id, role: user.role };

      return {
        access_token: await this.jwtService.signAsync(payload),
        user: {
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.owner ? user.owner.email : user.resident.email,
          phone: user.owner ? user.owner.phone : user.resident.phone,
          photo: user.owner ? user.owner.photo : user.resident.photo,
          house: user.owner ? user.owner.house : user.resident.owner.house,
          square: user.owner ? user.owner.square : user.resident.owner.square,
        },
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  private async findOwnerOrResident({
    email,
    pass,
  }: {
    email: string;
    pass: string;
  }) {
    try {
      const owner = await this.prisma.owner.findUnique({
        where: {
          email,
        },
      });

      const resident = await this.prisma.resident.findUnique({
        where: {
          email,
        },
      });

      if (!!owner && compare(pass, owner.password)) {
        return await this.prisma.user.findUniqueOrThrow({
          where: { id: owner.userId },
          select: {
            name: true,
            available: true,
            id: true,
            role: { select: { name: true, id: true } },
            owner: {
              select: {
                email: true,
                id: true,
                phone: true,
                photo: true,
                cpf: true,
                house: true,
                square: true,
              },
            },
          },
        });
      }

      if (!!resident && compare(pass, resident.password)) {
        return await this.prisma.user.findUniqueOrThrow({
          where: { id: owner.userId },
          select: {
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
                owner: {
                  select: {
                    id: true,
                    house: true,
                    square: true,
                  },
                },
              },
            },
          },
        });
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
