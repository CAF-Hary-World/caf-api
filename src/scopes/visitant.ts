export const selectVisitantScope = {
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

export const selectOwnerScope = {
  name: true,
  available: {
    include: { justifications: { include: { justification: true } } },
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
      residents: {
        select: {
          email: true,
          id: true,
          phone: true,
          cpf: true,
          photo: true,
        },
      },
    },
  },
};
