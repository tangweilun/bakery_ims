import { prisma } from "@/lib/prisma";

export interface IngredientRequirement {
  id: number;
  name: string;
  unit: string;
  requiredAmount: number;
  currentStock: number;
  category: string;
}

export const ingredientRequirementsService = {
  /**
   * Calculate ingredient requirements based on forecasted sales for a recipe
   */
  calculateRequirements: async (
    recipeId: number,
    forecastQuantity: number
  ): Promise<IngredientRequirement[]> => {
    console.log("[DEBUG] Calculating ingredient requirements:", {
      recipeId,
      forecastQuantity,
    });

    try {
      // Get recipe with its ingredients
      const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        include: {
          recipeIngredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });

      if (!recipe) {
        throw new Error(`Recipe with ID ${recipeId} not found`);
      }

      // Calculate required ingredients based on forecast
      const requirements: IngredientRequirement[] = recipe.recipeIngredients.map(
        (ri) => {
          // Calculate total required amount based on recipe quantity and forecast
          const requiredAmount = (ri.quantity * forecastQuantity) / recipe.yieldQuantity;

          return {
            id: ri.ingredient.id,
            name: ri.ingredient.name,
            unit: ri.ingredient.unit,
            requiredAmount: Math.round(requiredAmount * 100) / 100, // Round to 2 decimal places
            currentStock: ri.ingredient.currentStock,
            category: ri.ingredient.category,
          };
        }
      );

      console.log("[DEBUG] Calculated requirements:", requirements);
      return requirements;
    } catch (error) {
      console.error("Error calculating ingredient requirements:", error);
      throw error;
    }
  },
};