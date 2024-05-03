import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export class Seed {
  constructor(private readonly prismaService: PrismaService) {}

  async createDefaultRoles() {
    try {
      const defaultRoles: Array<Prisma.RoleCreateInput> = [];
      const roles = await this.prismaService.role.findMany();

      const roleNames = roles.map((role) => role.name);

      !roleNames.includes('ADMIN') && defaultRoles.push({ name: 'ADMIN' });
      !roleNames.includes('OWNER') && defaultRoles.push({ name: 'OWNER' });
      !roleNames.includes('RESIDENT') &&
        defaultRoles.push({ name: 'RESIDENT' });
      !roleNames.includes('SECURITY') &&
        defaultRoles.push({ name: 'SECURITY' });
      !roleNames.includes('VISITANT') &&
        defaultRoles.push({ name: 'VISITANT' });
      !roleNames.includes('ROOT') && defaultRoles.push({ name: 'ROOT' });

      await this.prismaService.role.createMany({
        data: defaultRoles,
      });

      return;
    } catch (error) {
      throw new Error(error);
    }
  }

  async createDefaultJustifications() {
    try {
      const defaultJustifications: Array<Prisma.JustificationCreateInput> = [
        { description: 'Aguardando confirmação do email' },
        { description: 'Confirmação com a administração' },
        { description: 'Documentação pendente' },
      ];

      const defaultJustificationsDescriptions = defaultJustifications.map(
        (justification) => justification.description,
      );
      const justifications = await this.prismaService.justification.findMany();

      const justificationDescription = justifications.map(
        (justification) => justification.description,
      );

      if (
        defaultJustificationsDescriptions.some(
          (justification) => !justificationDescription.includes(justification),
        )
      )
        await this.prismaService.justification.createMany({
          data: defaultJustifications.map((justification) => ({
            description: justification.description,
          })),
        });

      return;
    } catch (error) {
      throw new Error(error);
    }
  }
}
