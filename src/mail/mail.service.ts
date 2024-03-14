import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Owner, User } from '@prisma/client';

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
}
