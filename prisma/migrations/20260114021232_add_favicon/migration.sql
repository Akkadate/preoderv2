/*
  Warnings:

  - You are about to drop the column `lineNotifyToken` on the `Shop` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Shop" DROP COLUMN "lineNotifyToken",
ADD COLUMN     "favicon" TEXT,
ADD COLUMN     "telegramBotToken" TEXT,
ADD COLUMN     "telegramChatId" TEXT;
