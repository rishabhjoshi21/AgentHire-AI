/*
  Warnings:

  - You are about to drop the column `storedFileName` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Resume` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "storedFileName",
DROP COLUMN "version";
