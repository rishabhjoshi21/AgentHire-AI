-- AlterTable
ALTER TABLE "JobDescription" ADD COLUMN     "jobUrl" TEXT,
ALTER COLUMN "rawContent" DROP NOT NULL;
