/*
  Warnings:

  - The values [PLANNER,RESUME,JOB_DESCRIPTION,MATCHING,INTERVIEW,LEARNING] on the enum `AgentType` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `AgentExecution` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `matchScore` on the `Analysis` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `name` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `JobDescription` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `JobDescription` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicture` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentChunk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InterviewQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InterviewSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LearningPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LearningTask` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `model` to the `AgentExecution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rawContent` to the `JobDescription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AgentExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "AgentType_new" AS ENUM ('RESUME_PARSER', 'JD_ANALYZER', 'RESUME_ANALYZER');
ALTER TABLE "AgentExecution" ALTER COLUMN "agentType" TYPE "AgentType_new" USING ("agentType"::text::"AgentType_new");
ALTER TYPE "AgentType" RENAME TO "AgentType_old";
ALTER TYPE "AgentType_new" RENAME TO "AgentType";
DROP TYPE "public"."AgentType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_jobDescriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_userId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentChunk" DROP CONSTRAINT "DocumentChunk_documentId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewQuestion" DROP CONSTRAINT "InterviewQuestion_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewSession" DROP CONSTRAINT "InterviewSession_analysisId_fkey";

-- DropForeignKey
ALTER TABLE "LearningPlan" DROP CONSTRAINT "LearningPlan_analysisId_fkey";

-- DropForeignKey
ALTER TABLE "LearningTask" DROP CONSTRAINT "LearningTask_planId_fkey";

-- DropIndex
DROP INDEX "User_email_idx";

-- AlterTable
ALTER TABLE "AgentExecution" ADD COLUMN     "completionTokens" INTEGER,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "model" VARCHAR(100) NOT NULL,
ADD COLUMN     "promptTokens" INTEGER,
ADD COLUMN     "totalTokens" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "AgentExecutionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Analysis" ADD COLUMN     "atsScore" INTEGER,
ALTER COLUMN "matchScore" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "name",
ADD COLUMN     "title" VARCHAR(255);

-- AlterTable
ALTER TABLE "JobDescription" DROP COLUMN "description",
DROP COLUMN "source",
ADD COLUMN     "rawContent" TEXT NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "company" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "content",
DROP COLUMN "status",
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "mimeType" VARCHAR(100),
ADD COLUMN     "optimizedContent" TEXT,
ADD COLUMN     "originalFileName" VARCHAR(255),
ADD COLUMN     "rawContent" TEXT,
ADD COLUMN     "storagePath" TEXT,
ADD COLUMN     "storedFileName" VARCHAR(255);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profilePicture",
DROP COLUMN "provider",
DROP COLUMN "providerId";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "DocumentChunk";

-- DropTable
DROP TABLE "InterviewQuestion";

-- DropTable
DROP TABLE "InterviewSession";

-- DropTable
DROP TABLE "LearningPlan";

-- DropTable
DROP TABLE "LearningTask";

-- DropEnum
DROP TYPE "AgentStatus";

-- DropEnum
DROP TYPE "AuthProvider";

-- DropEnum
DROP TYPE "DocumentStatus";

-- DropEnum
DROP TYPE "DocumentType";

-- DropEnum
DROP TYPE "InterviewDifficulty";

-- DropEnum
DROP TYPE "InterviewStatus";

-- DropEnum
DROP TYPE "JobSource";

-- DropEnum
DROP TYPE "LearningPlanStatus";

-- DropEnum
DROP TYPE "ResumeStatus";

-- CreateIndex
CREATE INDEX "AgentExecution_status_idx" ON "AgentExecution"("status");

-- CreateIndex
CREATE INDEX "JobDescription_deletedAt_idx" ON "JobDescription"("deletedAt");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Resume_deletedAt_idx" ON "Resume"("deletedAt");
