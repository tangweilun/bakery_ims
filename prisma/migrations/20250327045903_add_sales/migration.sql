/*
  Warnings:

  - The values [INGREDIENT_RESTOCKED] on the enum `ActivityAction` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `inventoryReportId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `restockHistoryId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `restockHistoryId` on the `Batch` table. All the data in the column will be lost.
  - You are about to drop the `InventoryReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RestockHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActivityAction_new" AS ENUM ('INGREDIENT_ADDED', 'INGREDIENT_UPDATED', 'INGREDIENT_DELETED', 'INGREDIENT_MARKED_INACTIVE', 'RECIPE_CREATED', 'RECIPE_UPDATED', 'RECIPE_DELETED', 'PRODUCTION_PLANNED', 'PRODUCTION_STARTED', 'PRODUCTION_COMPLETED', 'PRODUCTION_CANCELLED', 'INGREDIENT_USED', 'BATCH_CREATED', 'BATCH_UPDATED', 'BATCH_EXPIRED', 'BATCH_DEPLETED', 'BATCH_DELETED', 'ALERT_GENERATED', 'ALERT_ACKNOWLEDGED', 'ALERT_RESOLVED', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_LOGIN', 'USER_LOGOUT', 'SALE_CREATED', 'SALE_UPDATED', 'SALE_DELETED', 'REPORT_GENERATED', 'SYSTEM_BACKUP', 'SYSTEM_RESTORE', 'SYSTEM_ERROR');
ALTER TABLE "Activity" ALTER COLUMN "action" TYPE "ActivityAction_new" USING ("action"::text::"ActivityAction_new");
ALTER TYPE "ActivityAction" RENAME TO "ActivityAction_old";
ALTER TYPE "ActivityAction_new" RENAME TO "ActivityAction";
DROP TYPE "ActivityAction_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_inventoryReportId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_restockHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_restockHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryReport" DROP CONSTRAINT "InventoryReport_userId_fkey";

-- DropForeignKey
ALTER TABLE "RestockHistory" DROP CONSTRAINT "RestockHistory_ingredientId_fkey";

-- DropForeignKey
ALTER TABLE "RestockHistory" DROP CONSTRAINT "RestockHistory_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "RestockHistory" DROP CONSTRAINT "RestockHistory_userId_fkey";

-- DropIndex
DROP INDEX "Batch_restockHistoryId_key";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "inventoryReportId",
DROP COLUMN "restockHistoryId",
ADD COLUMN     "saleId" INTEGER;

-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "restockHistoryId";

-- DropTable
DROP TABLE "InventoryReport";

-- DropTable
DROP TABLE "RestockHistory";

-- CreateTable
CREATE TABLE "Sale" (
    "id" SERIAL NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "userId" UUID NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SaleItem_saleId_recipeId_key" ON "SaleItem"("saleId", "recipeId");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
