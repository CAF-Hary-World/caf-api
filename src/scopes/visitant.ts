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
    include: {
      user: {
        select: {
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
  cnh: true,
  cpf: true,
  documentUrl: true,
  email: true,
  id: true,
  kind: true,
  photo: true,
  phone: true,
};
