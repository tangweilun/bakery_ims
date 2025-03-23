"use client";

import { useState, useEffect } from "react";
import { Recipe, RecipeIngredient, Ingredient } from "@prisma/client";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { HistoryIcon } from "lucide-react";
import { useRouter } from "next/navigation";

type RecipeWithIngredients = Recipe & {
  recipeIngredients: (RecipeIngredient & {
    ingredient: Ingredient;
  })[];
};

type IngredientWithWaste = {
  id: number;
  name: string;
  unit: string;
  requiredQuantity: number;
  wasted: number;
};

export default function YieldManagementPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [recipeDetails, setRecipeDetails] =
    useState<RecipeWithIngredients | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [ingredients, setIngredients] = useState<IngredientWithWaste[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  // Fetch recipes on component mount
  useEffect(() => {
    async function fetchRecipes() {
      setIsLoadingRecipes(true);
      try {
        const response = await fetch("/api/recipes");
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
        toast.error("Failed to load recipes");
      } finally {
        setIsLoadingRecipes(false);
      }
    }

    fetchRecipes();
  }, []);

  // Fetch recipe ingredients when a recipe is selected
  useEffect(() => {
    if (!selectedRecipeId) return;

    async function fetchRecipeDetails() {
      setIsLoadingDetails(true);
      try {
        const response = await fetch(`/api/recipes/${selectedRecipeId}`);
        const data = await response.json();
        setRecipeDetails(data);
        // Check if recipeIngredients exists before mapping
        if (!data.recipeIngredients || !Array.isArray(data.recipeIngredients)) {
          console.error("Recipe ingredients data is missing or invalid:", data);
          toast.error("Invalid recipe data structure");
          setIngredients([]);
          return;
        }
        // Initialize ingredients with waste set to 0
        const ingredientsWithWaste = data.recipeIngredients.map((ri: any) => ({
          id: ri.ingredient.id,
          name: ri.ingredient.name,
          unit: ri.ingredient.unit,
          requiredQuantity: ri.quantity * quantity,
          wasted: 0,
        }));

        setIngredients(ingredientsWithWaste);
      } catch (error) {
        console.error("Failed to fetch recipe details:", error);
        toast.error("Failed to load recipe details");
        setIngredients([]);
      } finally {
        setIsLoadingDetails(false);
      }
    }

    fetchRecipeDetails();
  }, [selectedRecipeId, quantity]);

  // Update required quantities when quantity changes
  useEffect(() => {
    if (!recipeDetails || !recipeDetails.recipeIngredients) return;

    const updatedIngredients = recipeDetails.recipeIngredients.map(
      (ri: any) => {
        const existingIngredient = ingredients.find(
          (ing) => ing.id === ri.ingredient.id
        );
        return {
          id: ri.ingredient.id,
          name: ri.ingredient.name,
          unit: ri.ingredient.unit,
          requiredQuantity: ri.quantity * quantity,
          wasted: existingIngredient ? existingIngredient.wasted : 0,
        };
      }
    );

    setIngredients(updatedIngredients);
  }, [quantity, recipeDetails]);

  // Handle recipe selection change
  const handleRecipeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      setSelectedRecipeId(null);
      return;
    }
    const recipeId = parseInt(value);
    setSelectedRecipeId(recipeId);
  };

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  // Handle waste input change
  const handleWasteChange = (id: number, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setIngredients((prevIngredients) =>
      prevIngredients.map((ing) =>
        ing.id === id ? { ...ing, wasted: numValue } : ing
      )
    );
  };

  // Handle stock update
  const handleUpdateStock = async () => {
    if (!recipeDetails) {
      toast.error("Please select a recipe first");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/yield", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeId: recipeDetails.id,
          quantity,
          ingredients: ingredients.map((ing) => ({
            id: ing.id,
            wasted: ing.wasted,
          })),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Stock updated successfully");
        // Reset form or fetch updated data
      } else {
        // Handle specific error cases
        if (data.message === "Insufficient stock" && data.shortages) {
          // Create a detailed error message for insufficient stock
          const shortageMessages = data.shortages.map(
            (item: any) =>
              `${item.name}: Need ${item.needed} ${item.unit}, Available ${item.available} ${item.unit}`
          );

          toast.error(
            <div>
              <p className="font-bold">Insufficient stock:</p>
              <ul className="list-disc pl-4 mt-1">
                {shortageMessages.map((msg: string, i: number) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>,
            { autoClose: 8000 } // Give users more time to read detailed messages
          );
        } else {
          toast.error(data.error || data.message || "Failed to update stock");
        }
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("An error occurred while updating stock");
    } finally {
      setIsSubmitting(false);
    }
  };
  const navigateToHistory = () => {
    router.push("/yield/history");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Yield Management</h1>
          <Button
            variant="outline"
            onClick={navigateToHistory}
            className="flex items-center gap-2"
          >
            <HistoryIcon className="h-4 w-4" />
            View History
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Recipe Selection */}
          <div className="border rounded-lg p-4">
            <div className="mb-2">
              <label className="block font-medium mb-1">Select Recipe</label>
              {isLoadingRecipes ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  className="w-full border rounded p-2"
                  value={selectedRecipeId || ""}
                  onChange={handleRecipeChange}
                  disabled={isLoadingRecipes}
                >
                  <option value="">Select a recipe</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Quantity Input */}
          <div className="border rounded-lg p-4">
            <div className="mb-2">
              <label className="block font-medium mb-1">Quantity</label>
              {isLoadingDetails && selectedRecipeId ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  disabled={!selectedRecipeId || isLoadingDetails}
                />
              )}
            </div>
          </div>
        </div>

        {/* Ingredients Table with Loading State */}
        {selectedRecipeId && (
          <div className="border rounded-lg p-4 mb-6">
            <div className="mb-2">
              <h2 className="text-lg font-medium">Recipe Ingredients</h2>
              <p className="text-sm text-gray-500">
                Adjust for any wasted ingredients
              </p>
            </div>

            {isLoadingDetails ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : ingredients.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Ingredient</th>
                    <th className="text-left py-2">Required Quantity</th>
                    <th className="text-left py-2">Wasted</th>
                    <th className="text-left py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ingredient) => (
                    <tr key={ingredient.id} className="border-b">
                      <td className="py-3">{ingredient.name}</td>
                      <td className="py-3">
                        {ingredient.requiredQuantity} {ingredient.unit}
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          className="border rounded p-1 w-20"
                          value={ingredient.wasted}
                          onChange={(e) =>
                            handleWasteChange(ingredient.id, e.target.value)
                          }
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="py-3">{ingredient.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-4 text-gray-500">
                No ingredients found for this recipe
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            className={`bg-black text-white px-4 py-2 rounded-lg ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
            onClick={handleUpdateStock}
            disabled={isSubmitting || isLoadingDetails || !selectedRecipeId}
          >
            {isSubmitting ? "Updating..." : "Update Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
