/*
  Warnings:

  - You are about to drop the column `lowStockAlertId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the `LowStockAlert` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_lowStockAlertId_fkey";

-- DropForeignKey
ALTER TABLE "LowStockAlert" DROP CONSTRAINT "LowStockAlert_ingredientId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "lowStockAlertId";

-- DropTable
DROP TABLE "LowStockAlert";

-- DropEnum
DROP TYPE "AlertStatus";
