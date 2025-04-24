"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Recipe, RecipeIngredient } from "@/types/recipe";
import { Ingredient } from "@/types/ingredient";

// Form validation schema
const recipeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  preparationTime: z.coerce
    .number()
    .int()
    .min(0, "Must be a positive number")
    .optional(),
  bakingTime: z.coerce
    .number()
    .int()
    .min(0, "Must be a positive number")
    .optional(),
  yieldQuantity: z.coerce.number().int().min(1, "Yield must be at least 1"),
  instructions: z.string().optional(),
  sellingPrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
});

type RecipeFormValues = z.infer<typeof recipeFormSchema>;

interface RecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: Recipe | null;
  onSave: (recipe: Partial<Recipe>) => void;
}

// Define the type fetched from /api/recipes/[id]/ingredients
type FetchedRecipeIngredient = {
  id: number; // PK of RecipeIngredient link
  recipeId: number;
  ingredientId: number;
  quantity: number;
  name: string; // from included ingredient
  unit: string; // from included ingredient
};

export function RecipeDialog({
  open,
  onOpenChange,
  recipe,
  onSave,
}: RecipeDialogProps) {
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<
    FetchedRecipeIngredient[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [loadingRecipeIngredients, setLoadingRecipeIngredients] =
    useState(false);
  const isEditing = !!recipe?.id;

  // Form setup
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      preparationTime: 0,
      bakingTime: 0,
      yieldQuantity: 1,
      instructions: "",
      sellingPrice: 0,
    },
  });

  // --- Effect 1: Fetch ALL ingredients (for dropdown) when dialog opens ---
  useEffect(() => {
    const fetchAllIngredients = async () => {
      setLoadingIngredients(true);
      try {
        console.log("Dialog open: Fetching all ingredients list...");
        const response = await fetch("/api/ingredients", { cache: "no-store" }); // Use no-store
        if (!response.ok) throw new Error("Failed to fetch ingredients list");
        const data: Ingredient[] = await response.json();
        setAllIngredients(data);
      } catch (error) {
        console.error("Error fetching all ingredients:", error);
        toast.error("Failed to load ingredients list.");
        setAllIngredients([]); // Clear on error
      } finally {
        setLoadingIngredients(false);
      }
    };

    if (open) {
      fetchAllIngredients();
    } else {
      setAllIngredients([]); // Clear list when dialog closes
    }
  }, [open]);

  // --- Effect 2: Fetch CURRENT recipe's ingredients OR reset when 'open' or 'recipe' changes ---
  useEffect(() => {
    const fetchCurrentRecipeIngredients = async (recipeId: number) => {
      console.log(`Fetching ingredients for current recipe ID: ${recipeId}`);
      setLoadingRecipeIngredients(true);
      setRecipeIngredients([]); // Clear previous state immediately
      try {
        // Fetch from the correct endpoint
        const response = await fetch(`/api/recipes/${recipeId}/ingredients`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch recipe ingredients");
        // Use the specific type for the fetched data
        const data: FetchedRecipeIngredient[] = await response.json();
        console.log("Fetched CURRENT recipe ingredients:", data);
        setRecipeIngredients(data); // Set the fresh data with correct IDs
      } catch (error) {
        console.error("Error fetching current recipe ingredients:", error);
        toast.error("Failed to load current recipe ingredients.");
        setRecipeIngredients([]); // Clear on error
      } finally {
        setLoadingRecipeIngredients(false);
      }
    };

    if (open) {
      if (recipe?.id) {
        // If dialog is open AND we are editing an existing recipe
        fetchCurrentRecipeIngredients(recipe.id);
      } else {
        // If dialog is open AND we are creating a new recipe
        console.log(
          "Dialog open for NEW recipe, resetting recipeIngredients state."
        );
        setRecipeIngredients([]); // Reset for new recipe
        setLoadingRecipeIngredients(false);
      }
    } else {
      // If dialog is closed, reset everything
      setRecipeIngredients([]);
      setLoadingRecipeIngredients(false);
    }
    // Dependencies: Trigger when dialog opens/closes OR when the recipe object changes
  }, [open, recipe]);

  // --- Effect 3: Populate form fields when 'recipe' prop changes ---
  useEffect(() => {
    if (recipe) {
      console.log("Populating form for recipe ID:", recipe.id);
      form.reset({
        name: recipe.name,
        description: recipe.description || "",
        category: recipe.category,
        preparationTime: recipe.preparationTime ?? 0, // Use nullish coalescing
        bakingTime: recipe.bakingTime ?? 0, // Use nullish coalescing
        yieldQuantity: recipe.yieldQuantity,
        instructions: recipe.instructions || "",
        sellingPrice: recipe.sellingPrice ?? 0, // Use nullish coalescing
      });
    } else {
      // Reset form for a new recipe or when recipe is null
      console.log("Resetting form.");
      form.reset({
        name: "",
        description: "",
        category: "",
        preparationTime: 0,
        bakingTime: 0,
        yieldQuantity: 1,
        instructions: "",
        sellingPrice: 0,
      });
    }
    // Dependency: Only when the recipe object itself changes. 'form' is stable.
  }, [recipe, form]);

  // Add ingredient to recipe
  const handleAddIngredient = () => {
    setRecipeIngredients((prev) => [
      ...prev,
      {
        id: 0,
        recipeId: recipe?.id || 0,
        ingredientId: 0,
        quantity: 0,
        name: "Select...",
        unit: "",
      },
    ]);
  };

  // Remove ingredient from recipe
  const handleRemoveIngredient = (index: number) => {
    setRecipeIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Update ingredient details
  const handleIngredientChange = (
    index: number,
    field: "ingredientId" | "quantity",
    value: string | number
  ) => {
    setRecipeIngredients((prev) => {
      const updated = [...prev];
      const currentItem = updated[index];

      if (field === "ingredientId") {
        const selectedId = Number(value);
        const selectedMasterIngredient = allIngredients.find(
          (i) => i.id === selectedId
        );
        if (selectedMasterIngredient) {
          updated[index] = {
            ...currentItem,
            ingredientId: selectedId,
            name: selectedMasterIngredient.name,
            unit: selectedMasterIngredient.unit,
          };
        } else {
          updated[index] = {
            ...currentItem,
            ingredientId: 0,
            name: "Select...",
            unit: "",
          };
        }
      } else if (field === "quantity") {
        const numValue = Number(value);
        updated[index] = { ...currentItem, quantity: Math.max(0, numValue) };
      }
      return updated;
    });
  };

  // Form submission
  const onSubmit = async (formData: RecipeFormValues) => {
    console.log("Form submitted. Validating ingredients...");
    const invalidIngredient = recipeIngredients.find(
      (ing) => !ing.ingredientId || ing.ingredientId <= 0 || ing.quantity <= 0
    );

    if (recipeIngredients.length === 0) {
      toast.error("Please add at least one ingredient.");
      return;
    }

    if (invalidIngredient) {
      toast.error(
        `Please select a valid ingredient and enter a positive quantity for "${
          invalidIngredient.name ||
          `row ${recipeIngredients.indexOf(invalidIngredient) + 1}`
        }".`
      );
      return;
    }

    const recipeDataToSave = {
      ...formData,
      id: recipe?.id,
      recipeIngredients: recipeIngredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
        id: ing.id > 0 ? ing.id : undefined,
      })),
    };

    console.log(
      "Submitting data to onSave callback:",
      JSON.stringify(recipeDataToSave, null, 2)
    );
    setIsLoading(true);
    try {
      await onSave(recipeDataToSave);
    } catch (error) {
      console.error("Error during onSave processing:", error);
      toast.error("Failed to save recipe.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get list of available categories (normally would be from API)
  const categories = ["Bread", "Pastry", "Cake", "Cookie", "Savory", "Other"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Recipe" : "Add New Recipe"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update recipe details and ingredients"
              : "Create a new recipe for your bakery"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg">Recipe Ingredients</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddIngredient}
                disabled={loadingIngredients}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>

            {loadingIngredients || loadingRecipeIngredients ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recipeIngredients.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 text-center border rounded-md">
                No ingredients added yet. Click &quot;Add Ingredient&quot;.
              </div>
            ) : (
              <div className="space-y-3">
                {recipeIngredients.map((ingredient, index) => (
                  <div
                    key={ingredient.id || `new-${index}`}
                    className="flex gap-3 items-end p-3 border rounded-md bg-muted/30"
                  >
                    <div className="flex-1">
                      <FormLabel className="text-xs">Ingredient</FormLabel>
                      <Select
                        value={
                          ingredient.ingredientId > 0
                            ? ingredient.ingredientId.toString()
                            : ""
                        }
                        onValueChange={(value) =>
                          handleIngredientChange(index, "ingredientId", value)
                        }
                        disabled={loadingIngredients}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ingredient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none" disabled>
                            Select...
                          </SelectItem>
                          {allIngredients.map((ing) => (
                            <SelectItem key={ing.id} value={ing.id.toString()}>
                              {ing.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {ingredient.ingredientId <= 0 && (
                        <p className="text-xs text-red-500 mt-1">Required</p>
                      )}
                    </div>

                    <div className="w-24">
                      <FormLabel className="text-xs">Quantity</FormLabel>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={ingredient.quantity.toString()}
                        onChange={(e) =>
                          handleIngredientChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        placeholder="Qty"
                        className={
                          ingredient.quantity <= 0 ? "border-red-500" : ""
                        }
                      />
                      {ingredient.quantity <= 0 && (
                        <p className="text-xs text-red-500 mt-1">Required</p>
                      )}
                    </div>

                    <div className="w-20 pt-5">
                      <Input
                        type="text"
                        value={ingredient.unit || "unit"}
                        disabled
                        className="mt-1 bg-transparent border-none text-muted-foreground text-sm"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveIngredient(index)}
                      className="text-destructive hover:bg-destructive/10"
                      title="Remove Ingredient"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <h3 className="font-medium text-lg border-t pt-4">
              Recipe Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Recipe Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Sourdough Bread" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none" disabled>
                          Select...
                        </SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sellingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preparationTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time (min)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bakingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bake Time (min)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yieldQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yield Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description (optional)"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed instructions (optional)"
                        className="min-h-[100px]"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : isEditing
                  ? "Update Recipe"
                  : "Create Recipe"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
