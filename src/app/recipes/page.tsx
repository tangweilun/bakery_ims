"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Search, Eye } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { RecipeDialog } from "./recipe-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { Recipe, RecipeWithIngredients } from "@/types/recipe";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";

export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog states
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Fetch recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch("/api/recipes");
        if (!response.ok) throw new Error("Failed to fetch recipes");
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        toast.error("Failed to load recipes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Filter recipes by search term
  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle recipe creation/update
  const handleRecipeSave = async (recipe: Partial<Recipe>) => {
    try {
      setIsLoading(true);

      const isEditing = !!recipe.id;
      const url = isEditing ? `/api/recipes/${recipe.id}` : "/api/recipes";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });

      if (!response.ok)
        throw new Error(`Failed to ${isEditing ? "update" : "create"} recipe`);

      const savedRecipe = await response.json();

      if (isEditing) {
        setRecipes(
          recipes.map((r) => (r.id === savedRecipe.id ? savedRecipe : r))
        );
        toast.success("Recipe updated successfully");
      } else {
        setRecipes([...recipes, savedRecipe]);
        toast.success("Recipe created successfully");
      }

      setRecipeDialogOpen(false);
      setSelectedRecipe(null);
      router.refresh();
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error(
        `Failed to ${recipe.id ? "update" : "create"} recipe. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle recipe deletion
  const handleRecipeDelete = async () => {
    if (!selectedRecipe) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/recipes/${selectedRecipe.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete recipe");

      setRecipes(recipes.filter((recipe) => recipe.id !== selectedRecipe.id));
      toast.success("Recipe deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedRecipe(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header/Navigation */}
      <div className="border-b bg-white shadow-sm">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Recipe Management</h1>
          <Button
            onClick={() => {
              setSelectedRecipe(null);
              setRecipeDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Recipe
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recipes</CardTitle>
            <CardDescription>
              Manage your bakery recipes and their ingredients
            </CardDescription>
            <div className="flex items-center gap-4 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipes by name or category..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-6">Loading recipes...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Preparation Time</TableHead>
                      <TableHead>Baking Time</TableHead>
                      <TableHead>Yield</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecipes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No recipes found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecipes.map((recipe) => (
                        <TableRow key={recipe.id}>
                          <TableCell className="font-medium">
                            {recipe.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{recipe.category}</Badge>
                          </TableCell>
                          <TableCell>
                            {recipe.preparationTime
                              ? `${recipe.preparationTime} min`
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {recipe.bakingTime
                              ? `${recipe.bakingTime} min`
                              : "N/A"}
                          </TableCell>
                          <TableCell>{recipe.yieldQuantity}</TableCell>
                          <TableCell>
                            ${recipe.sellingPrice.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedRecipe(recipe);
                                  setRecipeDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedRecipe(recipe);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recipe Create/Edit Dialog */}
        <RecipeDialog
          open={recipeDialogOpen}
          onOpenChange={setRecipeDialogOpen}
          recipe={selectedRecipe}
          onSave={handleRecipeSave}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Recipe"
          description={`Are you sure you want to delete "${selectedRecipe?.name}"? This action cannot be undone and will remove all recipe ingredients.`}
          onConfirm={handleRecipeDelete}
        />
      </div>
    </div>
  );
}
