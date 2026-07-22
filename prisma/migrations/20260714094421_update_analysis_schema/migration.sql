/*
  Warnings:

  - You are about to drop the column `matchScore` on the `Analysis` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[resumeId,jobDescriptionId]` on the table `Analysis` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Analysis_jobDescriptionId_idx";

-- DropIndex
DROP INDEX "Analysis_resumeId_idx";

-- AlterTable
ALTER TABLE "Analysis" DROP COLUMN "matchScore",
ADD COLUMN     "aiModel" VARCHAR(100),
ADD COLUMN     "resumeMatchScore" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_resumeId_jobDescriptionId_key" ON "Analysis"("resumeId", "jobDescriptionId");
