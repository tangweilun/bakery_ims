-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('INGREDIENT_ADDED', 'INGREDIENT_UPDATED', 'INGREDIENT_DELETED', 'RECIPE_CREATED', 'RECIPE_UPDATED', 'RECIPE_DELETED', 'PRODUCTION_PLANNED', 'PRODUCTION_STARTED', 'PRODUCTION_COMPLETED', 'PRODUCTION_CANCELLED', 'INGREDIENT_RESTOCKED', 'INGREDIENT_USED', 'BATCH_CREATED', 'BATCH_UPDATED', 'BATCH_EXPIRED', 'BATCH_DEPLETED', 'ALERT_GENERATED', 'ALERT_ACKNOWLEDGED', 'ALERT_RESOLVED', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_LOGIN', 'USER_LOGOUT', 'REPORT_GENERATED', 'SYSTEM_BACKUP', 'SYSTEM_RESTORE', 'SYSTEM_ERROR');

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "currentStock" DOUBLE PRECISION NOT NULL,
    "minimumStock" DOUBLE PRECISION NOT NULL,
    "idealStock" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "supplierId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "preparationTime" INTEGER,
    "bakingTime" INTEGER,
    "yieldQuantity" INTEGER NOT NULL,
    "instructions" TEXT,
    "sellingPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" SERIAL NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "remainingQuantity" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT,
    "notes" TEXT,
    "restockHistoryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchUsage" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "usageRecordId" INTEGER NOT NULL,
    "quantityUsed" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionRecord" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "status" "ProductionStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestockHistory" (
    "id" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "supplierId" INTEGER,
    "quantity" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "invoiceNumber" TEXT,
    "notes" TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestockHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "productionRecordId" INTEGER,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LowStockAlert" (
    "id" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "currentLevel" DOUBLE PRECISION NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LowStockAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandForecast" (
    "id" SERIAL NOT NULL,
    "ingredientId" INTEGER,
    "recipeId" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "forecastQuantity" DOUBLE PRECISION NOT NULL,
    "confidenceLevel" DOUBLE PRECISION,
    "factors" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandForecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryReport" (
    "id" SERIAL NOT NULL,
    "reportType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reportData" TEXT NOT NULL,
    "notes" TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "description" TEXT NOT NULL,
    "details" TEXT,
    "userId" UUID NOT NULL,
    "ingredientId" INTEGER,
    "supplierId" INTEGER,
    "recipeId" INTEGER,
    "batchId" INTEGER,
    "productionRecordId" INTEGER,
    "restockHistoryId" INTEGER,
    "usageRecordId" INTEGER,
    "lowStockAlertId" INTEGER,
    "inventoryReportId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_name_key" ON "Recipe"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeId_ingredientId_key" ON "RecipeIngredient"("recipeId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_batchNumber_key" ON "Batch"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_restockHistoryId_key" ON "Batch"("restockHistoryId");

-- CreateIndex
CREATE UNIQUE INDEX "BatchUsage_batchId_usageRecordId_key" ON "BatchUsage"("batchId", "usageRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_restockHistoryId_fkey" FOREIGN KEY ("restockHistoryId") REFERENCES "RestockHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchUsage" ADD CONSTRAINT "BatchUsage_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchUsage" ADD CONSTRAINT "BatchUsage_usageRecordId_fkey" FOREIGN KEY ("usageRecordId") REFERENCES "UsageRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRecord" ADD CONSTRAINT "ProductionRecord_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionRecord" ADD CONSTRAINT "ProductionRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestockHistory" ADD CONSTRAINT "RestockHistory_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestockHistory" ADD CONSTRAINT "RestockHistory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestockHistory" ADD CONSTRAINT "RestockHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_productionRecordId_fkey" FOREIGN KEY ("productionRecordId") REFERENCES "ProductionRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LowStockAlert" ADD CONSTRAINT "LowStockAlert_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryReport" ADD CONSTRAINT "InventoryReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_productionRecordId_fkey" FOREIGN KEY ("productionRecordId") REFERENCES "ProductionRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_restockHistoryId_fkey" FOREIGN KEY ("restockHistoryId") REFERENCES "RestockHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_usageRecordId_fkey" FOREIGN KEY ("usageRecordId") REFERENCES "UsageRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_lowStockAlertId_fkey" FOREIGN KEY ("lowStockAlertId") REFERENCES "LowStockAlert"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_inventoryReportId_fkey" FOREIGN KEY ("inventoryReportId") REFERENCES "InventoryReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
