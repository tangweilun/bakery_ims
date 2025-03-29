import { prisma } from "@/lib/prisma";

export interface SalesData {
  date: string;
  recipeId: number;
  recipeName: string;
  quantity: number;
}

export interface AggregatedSalesData {
  recipeId: number;
  recipeName: string;
  dates: string[];
  quantities: number[];
}

export const salesService = {
  /**
   * Get historical sales data for a specific recipe
   */
  getRecipeSalesHistory: async (
    recipeId: number,
    days: number = 90
  ): Promise<SalesData[]> => {
    console.log(
      `[DEBUG] getRecipeSalesHistory: Fetching sales history for recipeId=${recipeId}, days=${days}`
    );

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 2000);

    console.log(
      `[DEBUG] getRecipeSalesHistory: Using startDate=${startDate.toISOString()}`
    );

    try {
      const salesData = await prisma.saleItem.findMany({
        where: {
          recipeId,
          sale: {
            datetime: {
              gte: startDate,
            },
          },
        },
        select: {
          quantity: true,
          recipe: {
            select: {
              id: true,
              name: true,
            },
          },
          sale: {
            select: {
              datetime: true,
            },
          },
        },
        orderBy: {
          sale: {
            datetime: "asc",
          },
        },
      });

      console.log(
        `[DEBUG] getRecipeSalesHistory: Found ${salesData.length} sales records`
      );

      const result = salesData.map((item) => ({
        date: item.sale.datetime.toISOString().split("T")[0],
        recipeId: item.recipe.id,
        recipeName: item.recipe.name,
        quantity: item.quantity,
      }));

      console.log(
        `[DEBUG] getRecipeSalesHistory: Processed ${result.length} sales data points`
      );
      if (result.length > 0) {
        console.log(
          `[DEBUG] getRecipeSalesHistory: First date=${
            result[0].date
          }, Last date=${result[result.length - 1].date}`
        );
      } else {
        console.log(
          `[DEBUG] getRecipeSalesHistory: No sales data found for recipe ${recipeId}`
        );
      }

      return result;
    } catch (error) {
      console.error(`[DEBUG] getRecipeSalesHistory ERROR:`, error);
      throw error;
    }
  },

  /**
   * Get aggregated sales data for all recipes
   */
  getAllRecipesSalesHistory: async (
    days: number = 90
  ): Promise<AggregatedSalesData[]> => {
    console.log(
      `[DEBUG] getAllRecipesSalesHistory: Fetching sales history for all recipes, days=${days}`
    );

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const recipes = await prisma.recipe.findMany({
        select: {
          id: true,
          name: true,
        },
      });

      console.log(
        `[DEBUG] getAllRecipesSalesHistory: Found ${recipes.length} recipes`
      );

      const result: AggregatedSalesData[] = [];

      for (const recipe of recipes) {
        console.log(
          `[DEBUG] getAllRecipesSalesHistory: Processing recipe ${recipe.id} (${recipe.name})`
        );

        const salesData = await salesService.getRecipeSalesHistory(
          recipe.id,
          days
        );

        // Group by date and sum quantities
        const dateMap = new Map<string, number>();
        salesData.forEach((item) => {
          const existing = dateMap.get(item.date) || 0;
          dateMap.set(item.date, existing + item.quantity);
        });

        // Sort dates
        const sortedDates = Array.from(dateMap.keys()).sort();

        console.log(
          `[DEBUG] getAllRecipesSalesHistory: Recipe ${recipe.id} has data for ${sortedDates.length} unique dates`
        );

        result.push({
          recipeId: recipe.id,
          recipeName: recipe.name,
          dates: sortedDates,
          quantities: sortedDates.map((date) => dateMap.get(date) || 0),
        });
      }

      console.log(
        `[DEBUG] getAllRecipesSalesHistory: Processed sales data for ${result.length} recipes`
      );

      return result;
    } catch (error) {
      console.error(`[DEBUG] getAllRecipesSalesHistory ERROR:`, error);
      throw error;
    }
  },
};
