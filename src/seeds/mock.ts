import { Prisma } from '@prisma/client';
import { generate } from 'gerador-validador-cpf';
import * as bcrypto from 'bcrypt';

function encodeSha256(text: string) {
  const salt = bcrypto.genSaltSync(15);
  return bcrypto.hashSync(text, salt);
}

export const mockedUser = {
  name: 'User Owner Seeded',
};

export const mockedOwner = {
  cpf: generate({ format: true }),
  email: 'secoh19398@evimzo.com',
  house: '1000',
  square: '1000',
  password: encodeSha256('123123123'),
  phone: '(84) 99819-0309',
};

export const mockedVisitants: Array<Prisma.VisitantCreateManyOwnerInput> =
  Array(20)
    .fill(null)
    .map((_, index) => ({
      cpf: generate({ format: true }),
      kind: 'PEDESTRIAN',
      name: `Visitant Seeded ${index}`,
      phone: '(84) 99819-0309',
    }));
