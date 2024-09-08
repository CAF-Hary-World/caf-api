import { Prisma, Role } from '@prisma/client';
import { MemoryCache } from 'memory-cache-node';

const TIMETOEXPIRECACHE = process.env.NODE_ENV === 'test' ? 5 : 60 * 60; // 1 hour to expire items

const AMOUNTSINGLERESOURCE = 100000;

export const rolesInMemory = new MemoryCache<string, Array<Role>>(
  TIMETOEXPIRECACHE,
  AMOUNTSINGLERESOURCE,
);

export const roleInMemory = new MemoryCache<string, Role>(TIMETOEXPIRECACHE, 6);

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
  AMOUNTSINGLERESOURCE, // number of items
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
  AMOUNTSINGLERESOURCE, // number of items
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
  AMOUNTSINGLERESOURCE, // number of items
);

export const adminsInMemory = new MemoryCache<
  string,
  Array<Prisma.UserGetPayload<SelectAdmin>>
>(
  TIMETOEXPIRECACHE,
  AMOUNTSINGLERESOURCE, // number of items
);

export type SelectOwner = {
  select: {
    name: true;
    available: { include: { justifications: true } };
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
      };
    };
  };
};

export const ownerInMemory = new MemoryCache<
  string,
  Prisma.UserGetPayload<SelectOwner> | null
>(
  TIMETOEXPIRECACHE,
  AMOUNTSINGLERESOURCE, // number of items
);

export const ownersInMemory = new MemoryCache<
  string,
  Array<Prisma.UserGetPayload<SelectOwner>>
>(
  TIMETOEXPIRECACHE,
  AMOUNTSINGLERESOURCE, // number of items
);

export type SelectResident = {
  select: {
    name: true;
    available: true;
    id: true;
    role: { select: { name: true; id: true } };
    resident: {
      select: {
        id: true;
        cpf: true;
        email: true;
        phone: true;
        photo: true;
        visitants: true;
        owner: {
          select: {
            id: true;
            house: true;
            square: true;
          };
        };
      };
    };
  };
};

export const residentInMemory = new MemoryCache<
  string,
  Prisma.UserGetPayload<SelectResident> | null
>(
  TIMETOEXPIRECACHE,
  AMOUNTSINGLERESOURCE, // number of items
);

export const residentsInMemory = new MemoryCache<
  string,
  Array<Prisma.UserGetPayload<SelectResident>>
>(
  TIMETOEXPIRECACHE,
  AMOUNTSINGLERESOURCE, // number of items
);

export type SelectResidentVisitant = {
  select: {
    resident: {
      select: {
        visitants: SelectVisitant;
      };
    };
  };
};

export const residentVisitantInMemory = new MemoryCache<
  string,
  Prisma.UserGetPayload<SelectResidentVisitant> | null
>(
  TIMETOEXPIRECACHE,
  AMOUNTSINGLERESOURCE, // number of items
);

export const residentVisitantsInMemory = new MemoryCache<
  string,
  Array<Prisma.UserGetPayload<SelectResidentVisitant>> | null
>(
  TIMETOEXPIRECACHE,
  AMOUNTSINGLERESOURCE, // number of items
);

export type SelectVisitant = {
  select: {
    available: {
      select: {
        status: true;
        justifications: {
          select: {
            justification: {
              select: {
                description: true;
              };
            };
          };
        };
      };
    };
    permissions: {
      where: {
        deletedAt: null;
      };
      select: {
        user: {
          select: {
            owner: {
              select: {
                house: true;
                square: true;
              };
            };
            resident: {
              select: {
                owner: {
                  select: {
                    house: true;
                    square: true;
                  };
                };
              };
            };
          };
        };
      };
    };
    name: true;
    cpf: true;
    documentUrl: true;
    email: true;
    id: true;
    kind: true;
    photo: true;
    phone: true;
  };
};

export const visitantInMemory = new MemoryCache<
  string,
  Prisma.VisitantGetPayload<SelectVisitant> | null
>(TIMETOEXPIRECACHE, AMOUNTSINGLERESOURCE);

export const visitantsInMemory = new MemoryCache<
  string,
  Array<Prisma.VisitantGetPayload<SelectVisitant> | null>
>(TIMETOEXPIRECACHE, AMOUNTSINGLERESOURCE);

export type SelectNotification = {
  select: {
    id: true;
    title: true;
    body: true;
    status: true;
  };
};

export const notificationInMemory = new MemoryCache<
  string,
  Prisma.NotificationGetPayload<SelectNotification> | null
>(TIMETOEXPIRECACHE, AMOUNTSINGLERESOURCE);

export const notificationsInMemory = new MemoryCache<
  string,
  Array<Prisma.NotificationGetPayload<SelectNotification> | null>
>(TIMETOEXPIRECACHE, AMOUNTSINGLERESOURCE);
