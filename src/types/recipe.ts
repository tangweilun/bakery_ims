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
  recipeIngredients: {
    ingredientId: number;
    quantity: number;
    ingredient: {
      name: string;
      unit: string;
      currentStock: number;
    };
  }[];
}

export interface RecipeIngredient {
  id: number;
  recipeId: number;
  ingredientId: number;
  quantity: number;
}
