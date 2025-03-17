export interface Recipe {
  id: number;
  name: string;
  description: string | null;
  category: string;
  preparationTime: number | null;
  bakingTime: number | null;
  yieldQuantity: number;
  instructions: string | null;
  sellingPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  id: number;
  recipeId: number;
  ingredientId: number;
  quantity: number;
}

export interface RecipeWithIngredients extends Recipe {
  recipeIngredients: (RecipeIngredient & {
    ingredient: {
      id: number;
      name: string;
      unit: string;
    };
  })[];
}
