-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "refreshTokenHash" DROP NOT NULL,
ALTER COLUMN "expiresAt" DROP NOT NULL;
