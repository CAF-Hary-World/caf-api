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

export const selectUser = {
  select: {
    name: true,
    available: true,
    owner: {
      select: {
        house: true,
        square: true,
      },
    },
    resident: {
      select: {
        owner: {
          select: {
            house: true,
            square: true,
          },
        },
      },
    },
    id: true,
    role: { select: { name: true, id: true } },
  },
};

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
    available: {
      include: {
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
        visitantsCreated: true;
        residents: {
          select: {
            email: true;
            id: true;
            phone: true;
            cpf: true;
            photo: true;
            user: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        };
      };
    };
  };
};

export const selectOwner = {
  select: {
    name: true,
    available: {
      include: {
        justifications: {
          select: {
            justification: {
              select: {
                description: true,
              },
            },
          },
        },
      },
    },
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
        visitantsCreated: true,
        residents: {
          select: {
            email: true,
            id: true,
            phone: true,
            cpf: true,
            photo: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    },
  },
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
    available: {
      include: {
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
    id: true;
    role: { select: { name: true; id: true } };
    resident: {
      select: {
        id: true;
        cpf: true;
        email: true;
        phone: true;
        photo: true;
        visitantsCreated: true;
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

export const selectResident = {
  select: {
    name: true,
    available: {
      include: {
        justifications: {
          select: {
            justification: {
              select: {
                description: true,
              },
            },
          },
        },
      },
    },
    id: true,
    role: { select: { name: true, id: true } },
    resident: {
      select: {
        id: true,
        cpf: true,
        email: true,
        phone: true,
        photo: true,
        visitantsCreated: true,
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

export const residentVisitantInMemory = new MemoryCache<
  string,
  Prisma.VisitantGetPayload<SelectVisitant> | null
>(
  TIMETOEXPIRECACHE,
  AMOUNTSINGLERESOURCE, // number of items
);

export const residentVisitantsInMemory = new MemoryCache<
  string,
  Array<Prisma.UserGetPayload<SelectVisitant>> | null
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

export const selectVisitant = {
  available: {
    select: {
      status: true,
      justifications: {
        select: {
          justification: {
            select: {
              description: true,
            },
          },
        },
      },
    },
  },
  permissions: {
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      checkin: true,
      checkout: true,
      deletedAt: true,
      user: {
        select: {
          id: true,
          owner: {
            select: {
              house: true,
              square: true,
            },
          },
          resident: {
            select: {
              owner: {
                select: {
                  house: true,
                  square: true,
                },
              },
            },
          },
        },
      },
    },
  },
  name: true,
  cpf: true,
  documentUrl: true,
  email: true,
  id: true,
  kind: true,
  photo: true,
  phone: true,
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

export type Service = {
  select: {
    id: true;
    name: true;
    logo: true;
  };
};

export const selectService = {
  select: {
    id: true,
    name: true,
    logo: true,
  },
};

export const servicesInMemory = new MemoryCache<
  string,
  Array<Prisma.ServiceGetPayload<Service | null>>
>(TIMETOEXPIRECACHE, AMOUNTSINGLERESOURCE);

export type ServicePermission = {
  select: {
    id: true;
    checkin: true;
    checkout: true;
    user: {
      select: {
        id: true;
        name: true;
      };
    };
    service: {
      select: {
        id: true;
        name: true;
      };
    };
  };
};

export const selectServicePermission = {
  select: {
    id: true,
    checkin: true,
    checkout: true,
    user: {
      select: {
        id: true,
        name: true,
      },
    },
    service: {
      select: {
        id: true,
        name: true,
      },
    },
  },
};

export const servicesPermissionsInMemory = new MemoryCache<
  string,
  Array<Prisma.ServicePermissionGetPayload<ServicePermission | null>>
>(TIMETOEXPIRECACHE, AMOUNTSINGLERESOURCE);

export const serviceInMemory = new MemoryCache<
  string,
  Prisma.ServiceGetPayload<Service>
>(TIMETOEXPIRECACHE, AMOUNTSINGLERESOURCE);

export type Provider = {
  select: {
    id: true;
    name: true;
    _count: true;
    document: true;
    kind: true;
    plate: true;
  };
};

export const selectProvider = {
  select: {
    id: true,
    name: true,
    _count: true,
    document: true,
    kind: true,
    plate: true,
  },
};

export const providersInMemory = new MemoryCache<
  string,
  Array<Prisma.ProviderGetPayload<Provider | null>>
>(TIMETOEXPIRECACHE, AMOUNTSINGLERESOURCE);

export const providerInMemory = new MemoryCache<
  string,
  Prisma.ProviderGetPayload<Provider>
>(TIMETOEXPIRECACHE, AMOUNTSINGLERESOURCE);

export const logoInMemory = new MemoryCache<string, string>(
  TIMETOEXPIRECACHE,
  AMOUNTSINGLERESOURCE,
);

export type Parcel = {
  select: {
    status: true;
    from: true;
    house: true;
    imageUrl: true;
    recipient: true;
  };
};

export const selectParcel = {
  select: {
    status: true,
    from: true,
    house: true,
    imageUrl: true,
    recipient: true,
  },
};

export const parcelsInMemory = new MemoryCache<
  string,
  Array<Prisma.ParcelGetPayload<Parcel | null>>
>(TIMETOEXPIRECACHE, AMOUNTSINGLERESOURCE);

export const parcelInMemory = new MemoryCache<
  string,
  Prisma.ParcelGetPayload<Parcel | null>
>(TIMETOEXPIRECACHE, AMOUNTSINGLERESOURCE);
