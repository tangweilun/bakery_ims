-- AlterEnum
ALTER TYPE "ActivityAction" ADD VALUE 'INGREDIENT_MARKED_INACTIVE';

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
