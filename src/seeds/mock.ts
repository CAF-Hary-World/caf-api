import { Prisma } from '@prisma/client';
import { generate } from 'gerador-validador-cpf';
import { faker } from '@faker-js/faker';
import * as bcrypto from 'bcrypt';

function encodeSha256(text: string) {
  const salt = bcrypto.genSaltSync(15);
  return bcrypto.hashSync(text, salt);
}

export const mockedUser = {
  name: `${faker.person.fullName()} Seeded`,
};

export const mockedOwner = {
  cpf: generate({ format: true }),
  email: 'secoh19398@evimzo.com',
  house: faker.number.int({ min: 1, max: 1000 }).toString(),
  square: faker.number.int({ min: 1, max: 1000 }).toString(),
  password: encodeSha256('123123123'),
  phone: '(84) 99819-0309',
};

export const mockedVisitants: Array<Prisma.VisitantCreateManyOwnerInput> =
  Array(20)
    .fill(null)
    .map((_, index) => ({
      cpf: generate({ format: true }),
      kind: 'PEDESTRIAN',
      name: `Visitant ${faker.person.fullName()} Seeded ${index}`,
      phone: '(84) 99819-0309',
    }));
