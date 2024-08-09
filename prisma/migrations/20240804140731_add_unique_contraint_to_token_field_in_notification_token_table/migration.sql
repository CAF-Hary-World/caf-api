/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `NotificationToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NotificationToken_token_key" ON "NotificationToken"("token");
