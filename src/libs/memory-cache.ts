import { Prisma } from '@prisma/client';
import { MemoryCache } from 'memory-cache-node';

const TIMETOEXPIRECACHE = process.env.NODE_ENV === 'test' ? 5 : 60 * 60; // 1 hour to expire items

export const userInMemory = new MemoryCache<
  string,
  Prisma.UserGetPayload<{
    select: {
      name: true;
      available: true;
      id: true;
      role: { select: { name: true; id: true } };
    };
  }> | null
>(
  TIMETOEXPIRECACHE,
  100, // number of items
);

export const usersInMemory = new MemoryCache<
  string,
  Array<
    Prisma.UserGetPayload<{
      select: {
        name: true;
        available: true;
        id: true;
        role: { select: { name: true; id: true } };
      };
    }>
  >
>(
  TIMETOEXPIRECACHE,
  100, // number of items
);

export type SelectAdmin = {
  select: {
    name: true;
    available: true;
    id: true;
    role: { select: { name: true; id: true } };
    admin: { select: { email: true; id: true; phone: true; photo: true } };
  };
};

export const adminInMemory = new MemoryCache<
  string,
  Prisma.UserGetPayload<SelectAdmin> | null
>(
  TIMETOEXPIRECACHE,
  100, // number of items
);

export const adminsInMemory = new MemoryCache<
  string,
  Array<Prisma.UserGetPayload<SelectAdmin>>
>(
  TIMETOEXPIRECACHE,
  100, // number of items
);

export type SelectOwner = {
  select: {
    name: true;
    available: true;
    id: true;
    role: { select: { name: true; id: true } };
    owner: {
      select: {
        email: true;
        id: true;
        phone: true;
        photo: true;
        cpf: true;
        house: true;
        square: true;
        residents: {
          select: {
            email: true;
            id: true;
            phone: true;
            cpf: true;
            photo: true;
          };
        };
        visitants: {
          select: {
            cnh: true;
            cpf: true;
            email: true;
            kind: true;
            code: true;
            photo: true;
            id: true;
          };
        };
      };
    };
  };
};

export const ownerInMemory = new MemoryCache<
  string,
  Prisma.UserGetPayload<SelectOwner> | null
>(
  TIMETOEXPIRECACHE,
  100, // number of items
);

export const ownersInMemory = new MemoryCache<
  string,
  Array<Prisma.UserGetPayload<SelectOwner>>
>(
  TIMETOEXPIRECACHE,
  100, // number of items
);
