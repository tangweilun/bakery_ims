"use client";

import { useState, useEffect } from "react";
import { Recipe, RecipeIngredient, Ingredient } from "@prisma/client";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HistoryIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define types for recipe with ingredients
type RecipeWithIngredients = Recipe & {
  recipeIngredients: (RecipeIngredient & {
    ingredient: Ingredient;
  })[];
};

// Define type for ingredients with waste tracking
type IngredientWithWaste = {
  id: number;
  name: string;
  unit: string;
  requiredQuantity: number;
  wasted: number;
};

// Define type for shortage items in API response
type ShortageItem = {
  name: string;
  needed: number;
  available: number;
  unit: string;
};

// Define API response type
type YieldApiResponse = {
  message?: string;
  error?: string;
  shortages?: ShortageItem[];
};

export default function YieldManagementPage() {
  // State declarations
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [recipeDetails, setRecipeDetails] =
    useState<RecipeWithIngredients | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [ingredients, setIngredients] = useState<IngredientWithWaste[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for shortages
  const [shortages, setShortages] = useState<ShortageItem[]>([]);
  const [isShortageDialogOpen, setIsShortageDialogOpen] = useState(false);

  const router = useRouter();

  // Fetch all recipes on component mount
  useEffect(() => {
    async function fetchRecipes() {
      setIsLoadingRecipes(true);
      try {
        const response = await fetch("/api/recipes", { cache: "no-store" });
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

  // Fetch recipe details when selectedRecipeId changes
  useEffect(() => {
    if (!selectedRecipeId) {
      setRecipeDetails(null);
      setIngredients([]);
      return;
    }

    async function fetchRecipeDetails() {
      setIsLoadingDetails(true);
      try {
        const response = await fetch(`/api/recipes/${selectedRecipeId}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as RecipeWithIngredients;
        setRecipeDetails(data);
      } catch (error) {
        console.error("Failed to fetch recipe details:", error);
        toast.error("Failed to load recipe details");
        setRecipeDetails(null);
        setIngredients([]);
      } finally {
        setIsLoadingDetails(false);
      }
    }

    fetchRecipeDetails();
  }, [selectedRecipeId]);

  // Update ingredients when recipeDetails or quantity changes
  useEffect(() => {
    if (!recipeDetails || !recipeDetails.recipeIngredients) {
      setIngredients([]);
      return;
    }

    setIngredients((prevIngredients) => {
      const newIngredients = recipeDetails.recipeIngredients.map((ri) => {
        const existing = prevIngredients.find(
          (ing) => ing.id === ri.ingredient.id
        );
        return {
          id: ri.ingredient.id,
          name: ri.ingredient.name,
          unit: ri.ingredient.unit,
          requiredQuantity: ri.quantity * quantity,
          wasted: existing ? existing.wasted : 0,
        };
      });
      return newIngredients;
    });
  }, [recipeDetails, quantity]);

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

  // Add a new state for tracking input errors
  const [wasteInputErrors, setWasteInputErrors] = useState<Record<number, string>>({});
  
  // Handle waste input change
  const handleWasteChange = (id: number, value: string) => {
    // Clear error for this ingredient
    setWasteInputErrors(prev => ({ ...prev, [id]: '' }));
    
    // First check if the value is empty, allow it to be empty for UX
    if (value === '') {
      setIngredients((prevIngredients) =>
        prevIngredients.map((ing) =>
          ing.id === id ? { ...ing, wasted: 0 } : ing
        )
      );
      return;
    }
    
    // Convert to number and validate
    const numValue = parseFloat(value);
    
    // Check if it's a valid number and not negative
    if (isNaN(numValue)) {
      setWasteInputErrors(prev => ({ ...prev, [id]: 'Please enter a valid number' }));
      return; // Reject the input
    }
    
    if (numValue < 0) {
      setWasteInputErrors(prev => ({ ...prev, [id]: 'Value cannot be negative' }));
      return; // Reject the input
    }

    setIngredients((prevIngredients) =>
      prevIngredients.map((ing) =>
        ing.id === id ? { ...ing, wasted: numValue } : ing
      )
    );
  };

  // Handle stock update submission
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

      const data = (await response.json()) as YieldApiResponse;
      if (response.ok) {
        toast.success("Stock updated successfully");
      } else {
        if (
          data.message === "Insufficient non-expired stock" &&
          data.shortages
        ) {
          console.log("Shortage condition MET. Shortages:", data.shortages);
          setShortages(data.shortages || []);
          console.log("Calling setIsShortageDialogOpen(true)");
          setIsShortageDialogOpen(true);
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

  // Navigate to history page
  const navigateToHistory = () => {
    router.push("/yield/history");
  };

  // --- Add log inside the render function ---
  console.log(
    "Rendering YieldManagementPage, isShortageDialogOpen:",
    isShortageDialogOpen
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Yield Management</h1>
          <Button
            variant="outline"
            onClick={navigateToHistory}
            className="flex items-center gap-2"
          >
            <HistoryIcon className="h-4 w-4" />
            View History
          </Button>
        </div>

        {/* Wrap content in a Card */}
        <Card>
          <CardHeader>
            <CardTitle>Production Entry</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Recipe Selection and Quantity Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border rounded-lg p-4">
                <div className="mb-2">
                  <label className="block font-medium mb-1">
                    Select Recipe
                  </label>
                  {isLoadingRecipes ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
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

            {/* Ingredients Table */}
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
                            <div className="flex flex-col">
                              <input
                                type="number"
                                className={`border rounded p-1 w-20 ${wasteInputErrors[ingredient.id] ? 'border-red-500' : ''}`}
                                value={ingredient.wasted}
                                onChange={(e) =>
                                  handleWasteChange(ingredient.id, e.target.value)
                                }
                                onKeyDown={(e) => {
                                  // Prevent the minus sign from being entered
                                  if (e.key === '-' || e.key === 'e') {
                                    e.preventDefault();
                                  }
                                }}
                                min="0"
                                step="0.01"
                              />
                              {wasteInputErrors[ingredient.id] && (
                                <span className="text-red-500 text-xs mt-1">{wasteInputErrors[ingredient.id]}</span>
                              )}
                            </div>
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
                className={`bg-black text-white px-4 py-2 rounded-lg transition 
                  ${
                    isSubmitting ||
                    isLoadingDetails ||
                    isLoadingRecipes ||
                    !selectedRecipeId ||
                    ingredients.length === 0
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:bg-gray-800"
                  }`}
                onClick={handleUpdateStock}
                disabled={
                  isSubmitting ||
                  isLoadingDetails ||
                  isLoadingRecipes ||
                  !selectedRecipeId ||
                  ingredients.length === 0
                }
              >
                {isSubmitting
                  ? "Uploading..."
                  : isLoadingDetails || isLoadingRecipes
                  ? "Loading..."
                  : "Update Stock"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shortage Alert Dialog */}
      <AlertDialog
        open={isShortageDialogOpen}
        onOpenChange={setIsShortageDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Stock</AlertDialogTitle>
            <AlertDialogDescription>
              Production cannot proceed due to stock issues.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 text-sm">
            <p className="mb-2 text-muted-foreground">
              The following ingredients are insufficient to complete the recipe:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {shortages.map((item, index) => (
                <li key={index}>
                  <span className="font-medium">{item.name}</span>: Need{" "}
                  {item.needed} {item.unit}, Available {item.available}{" "}
                  {item.unit}
                </li>
              ))}
            </ul>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsShortageDialogOpen(false)}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
