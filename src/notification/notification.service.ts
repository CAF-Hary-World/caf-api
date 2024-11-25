import { Injectable } from '@nestjs/common';
import { Prisma, ROLE } from '@prisma/client';
import * as firebase from 'firebase-admin';
import {
  notificationInMemory,
  notificationsInMemory,
} from 'src/libs/memory-cache';
import { PrismaService } from 'src/prisma/prisma.service';
import { getDaysAgo, timeStampISOTime } from 'src/utils/time';

const serviceAccount = JSON.parse(process.env.FIREBASE);

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {}

  acceptPushNotification = async ({
    userId,
    token,
  }: {
    userId: string;
    token: string;
  }) => {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
        include: {
          role: true,
          owner: true,
          resident: {
            include: {
              owner: true,
            },
          },
        },
      });

      await Promise.all([
        firebase.messaging().subscribeToTopic(token, `role-${user.role.name}`),
        firebase.messaging().subscribeToTopic(token, `user-${user.id}`),
        user.role.name === 'OWNER' &&
          firebase
            .messaging()
            .subscribeToTopic(
              token,
              `address-${user.owner.square}-${user.owner.house}`,
            ),
        user.role.name === 'RESIDENT' &&
          firebase
            .messaging()
            .subscribeToTopic(
              token,
              `address-${user.resident.owner.square}-${user.resident.owner.house}`,
            ),
      ]);
    } catch (error) {
      throw error;
    }
  };

  disableNotification = async ({ id }: { id: string }) => {
    try {
      await this.prismaService.notification.update({
        where: {
          id,
        },
        data: {
          status: 'INACTIVE',
          deletedAt: timeStampISOTime,
          updatedAt: timeStampISOTime,
        },
      });
      notificationInMemory.clear();
      return notificationsInMemory.clear();
    } catch (error) {
      throw error;
    }
  };

  getUserNotifications = async ({
    userId,
  }: {
    userId: string;
  }): Promise<any> => {
    const reference = `notification-user-${userId}`;
    try {
      if (!notificationsInMemory.hasItem(reference)) {
        const notifications = await this.prismaService.notification.findMany({
          where: {
            user: {
              id: userId,
            },
            createdAt: {
              gte: getDaysAgo(1),
            },
            deletedAt: null,
          },
        });

        notificationsInMemory.storeExpiringItem(
          reference,
          notifications,
          process.env.NODE_ENV === 'test' ? 5 : 3600 * 24, // if test env expire in 5 miliseconds else 1 day
        );
      }
      return notificationsInMemory.retrieveItemValue(reference);
    } catch (error) {
      throw error;
    }
  };

  sendPushToUser = async ({
    body,
    role,
    path,
    title,
    userId,
  }: {
    role: ROLE;
    userId: string;
    path?: string;
    title: string;
    body: string;
  }): Promise<void> => {
    let link = process.env.COND_URL;
    if (role === 'SECURITY') link = process.env.SECURITY_URL;
    if (role === 'ADMIN' || role === 'ROOT') link = process.env.ADMIN_URL;
    try {
      await Promise.all([
        firebase.messaging().send({
          topic: `user-${userId}`,
          notification: {
            title,
            body,
          },
          data: {
            link: path ? link + path : link,
            icon: process.env.LOGO_URL,
          },
        }),
        this.prismaService.notification.create({
          data: {
            body,
            title,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        }),
      ]);
      notificationInMemory.clear();
      return notificationsInMemory.clear();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  sendPushByRole = async ({
    role,
    title,
    body,
  }: {
    role: ROLE;
    title: string;
    body: string;
  }): Promise<void> => {
    let link = process.env.COND_URL;
    if (role === 'SECURITY') link = process.env.SECURITY_URL;
    if (role === 'ADMIN' || role === 'ROOT') link = process.env.ADMIN_URL;
    try {
      // Fetch all users with the specific role
      const users = await this.prismaService.user.findMany({
        where: {
          role: {
            name: role, // Adjust this if role relation is slightly different
          },
        },
      });

      if (users.length === 0)
        throw new Error('No users found for the specified role');

      await Promise.all([
        ...users.map(async (user) =>
          this.prismaService.notification.create({
            data: {
              body,
              title,
              userId: user.id, // Set the userId for each notification
            },
          }),
        ),
        firebase
          .messaging()
          .send({
            topic: `role-${role}`,
            notification: {
              title,
              body,
            },
            data: {
              link,
              icon: process.env.LOGO_URL,
            },
          })
          .catch((error) => {
            throw error;
          }),
      ]);
      notificationInMemory.clear();
      return notificationsInMemory.clear();
    } catch (error) {
      throw error;
    }
  };

  sendPushByAddress = async ({
    address,
    users,
    title,
    body,
    roles,
  }: {
    roles: Array<ROLE>;
    users: Array<{ id: string }>;
    address: Prisma.OwnerGetPayload<{ select: { house: true; square: true } }>;
    title: string;
    body: string;
  }): Promise<void> => {
    let link = process.env.COND_URL;
    if (roles.includes('SECURITY')) link = process.env.SECURITY_URL;
    if (roles.includes('ADMIN') || roles.includes('ROOT'))
      link = process.env.ADMIN_URL;
    try {
      await Promise.all([
        ...users.map(async (user) =>
          this.prismaService.notification.create({
            data: {
              body,
              title,
              userId: user.id, // Set the userId for each notification
            },
          }),
        ),
        firebase
          .messaging()
          .send({
            topic: `address-${address.square}-${address.house}`,
            notification: {
              title,
              body,
            },
            data: {
              link,
              icon: process.env.LOGO_URL,
            },
          })
          .catch((error) => {
            throw error;
          }),
      ]);
      notificationInMemory.clear();
      return notificationsInMemory.clear();
    } catch (error) {
      throw error;
    }
  };

  sendsPushesByRole = async ({
    roles,
    title,
    path,
    body,
  }: {
    roles: Array<ROLE>;
    path?: string;
    title: string;
    body: string;
  }): Promise<void> => {
    try {
      roles.forEach(async (role) => {
        let link = process.env.COND_URL;
        if (role === 'SECURITY') link = process.env.SECURITY_URL;
        if (role === 'ADMIN' || role === 'ROOT') link = process.env.ADMIN_URL;

        const users = await this.prismaService.user.findMany({
          where: {
            role: {
              name: role, // Adjust this if role relation is slightly different
            },
          },
        });

        if (users.length === 0) return;

        await Promise.all([
          ...users.map(async (user) =>
            this.prismaService.notification.create({
              data: {
                body,
                title,
                userId: user.id, // Set the userId for each notification
              },
            }),
          ),
          firebase
            .messaging()
            .send({
              topic: `role-${role}`,
              notification: {
                title,
                body,
              },
              data: {
                link: path ? link + path : link,
                icon: process.env.LOGO_URL,
              },
            })
            .catch((error) => {
              throw error;
            }),
        ]);
      });

      notificationInMemory.clear();
      return notificationsInMemory.clear();
    } catch (error) {
      throw error;
    }
  };
}
