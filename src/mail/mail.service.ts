import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Owner, Resident, User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(
    user: Pick<User, 'name' | 'id'> & Pick<Owner, 'email'>,
  ) {
    const url = process.env.PLATAFORM_URL + `/confirmation?token=${user.id}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Bem vindo ao CAF! Confirme seu email',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: user.name,
        clientName: process.env.CLIENT_NAME,
        url,
      },
    });
  }

  async sendUserValidation(user: Pick<User, 'name'> & Pick<Owner, 'email'>) {
    const url = process.env.PLATAFORM_URL;

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Time CAF! Sua conta foi ativada com sucesso.',
      template: './available', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: user.name,
        clientName: process.env.CLIENT_NAME,
        url,
      },
    });
  }

  async sendResidentConfirmation({
    recipient,
    sender,
  }: {
    recipient: Pick<User, 'name' | 'id'> & Pick<Resident, 'email'>;
    sender: Pick<User, 'name'>;
  }) {
    const url =
      process.env.PLATAFORM_URL +
      `/confirmation-password?token=${recipient.id}`;

    await this.mailerService.sendMail({
      to: recipient.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Bem vindo ao CAF! Confirme seu email',
      template: './confirmationPassword', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        recipient: {
          name: recipient.name,
        },
        sender: {
          name: sender.name,
        },
        clientName: process.env.CLIENT_NAME || 'Controle de Ambientes Físicos',
        url,
      },
    });
  }
}
