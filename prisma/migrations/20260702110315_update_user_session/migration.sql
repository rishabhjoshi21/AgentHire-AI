/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `UserSession` table. All the data in the column will be lost.
  - You are about to drop the column `isRevoked` on the `UserSession` table. All the data in the column will be lost.
  - You are about to drop the column `lastUsedAt` on the `UserSession` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `UserSession` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `UserSession` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserSession_userId_isRevoked_idx";

-- AlterTable
ALTER TABLE "UserSession" DROP COLUMN "ipAddress",
DROP COLUMN "isRevoked",
DROP COLUMN "lastUsedAt",
DROP COLUMN "userAgent";

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_userId_key" ON "UserSession"("userId");
