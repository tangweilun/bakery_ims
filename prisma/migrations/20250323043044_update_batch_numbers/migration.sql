/*
  Warnings:

  - You are about to drop the column `batchNumber` on the `ProductionRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductionRecord" DROP COLUMN "batchNumber",
ADD COLUMN     "batchNumbers" TEXT[];
