-- AlterTable
ALTER TABLE "DemandForecast" ADD COLUMN     "actualQuantities" INTEGER[],
ADD COLUMN     "dates" TEXT[],
ADD COLUMN     "predictedQuantities" INTEGER[];
