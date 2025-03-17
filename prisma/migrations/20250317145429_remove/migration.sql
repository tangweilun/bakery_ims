/*
  Warnings:

  - You are about to drop the column `status` on the `ProductionRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductionRecord" DROP COLUMN "status";

-- DropEnum
DROP TYPE "ProductionStatus";
