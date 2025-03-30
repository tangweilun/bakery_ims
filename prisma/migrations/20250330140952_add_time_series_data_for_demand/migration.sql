/*
  Warnings:

  - You are about to drop the column `ingredientId` on the `DemandForecast` table. All the data in the column will be lost.
  - Added the required column `timeSeriesData` to the `DemandForecast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DemandForecast" DROP COLUMN "ingredientId",
ADD COLUMN     "timeSeriesData" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "DemandForecast" ADD CONSTRAINT "DemandForecast_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;
