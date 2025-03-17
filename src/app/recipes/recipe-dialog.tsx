// // app/dashboard/recipes/recipe-dialog.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { X, Plus, Trash2 } from "lucide-react";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Recipe, RecipeIngredient } from "@/types/recipe";
// import { Ingredient } from "@/types/ingredient";

// // Form validation schema
// const recipeFormSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   description: z.string().optional(),
//   category: z.string().min(1, "Category is required"),
//   preparationTime: z.coerce
//     .number()
//     .int()
//     .min(0, "Must be a positive number")
//     .optional(),
//   bakingTime: z.coerce
//     .number()
//     .int()
//     .min(0, "Must be a positive number")
//     .optional(),
//   yieldQuantity: z.coerce.number().int().min(1, "Yield must be at least 1"),
//   instructions: z.string().optional(),
//   sellingPrice: z.coerce.number().min(0.01, "Price must be greater than 0"),
// });

// type RecipeFormValues = z.infer<typeof recipeFormSchema>;

// interface RecipeDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   recipe: Recipe | null;
//   onSave: (recipe: Partial<Recipe>) => void;
// }

// export function RecipeDialog({
//   open,
//   onOpenChange,
//   recipe,
//   onSave,
// }: RecipeDialogProps) {
//   const [ingredients, setIngredients] = useState<Ingredient[]>([]);
//   const [recipeIngredients, setRecipeIngredients] = useState<
//     (RecipeIngredient & { name: string; unit: string })[]
//   >([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const isEditing = !!recipe?.id;

//   // Form setup
//   const form = useForm<RecipeFormValues>({
//     resolver: zodResolver(recipeFormSchema),
//     defaultValues: {
//       name: "",
//       description: "",
//       category: "",
//       preparationTime: 0,
//       bakingTime: 0,
//       yieldQuantity: 1,
//       instructions: "",
//       sellingPrice: 0,
//     },
//   });

//   //Fetch ingredients for select item ui
//   useEffect(() => {
//     const fetchIngredients = async () => {
//       try {
//         const response = await fetch("/api/ingredients");
//         if (!response.ok) throw new Error("Failed to fetch ingredients");
//         const data = await response.json();
//         setIngredients(data);
//       } catch (error) {
//         console.error("Error fetching ingredients:", error);
//         toast.error("Failed to load ingredients. Please try again.");
//       }
//     };

//     if (open) {
//       fetchIngredients();
//     }
//   }, [open]);

//   // Fetch recipe ingredients if editing
//   useEffect(() => {
//     const fetchRecipeIngredients = async (recipeId: number) => {
//       try {
//         const response = await fetch(`/api/recipes/${recipeId}/ingredients`);
//         if (!response.ok) throw new Error("Failed to fetch recipe ingredients");
//         const data = await response.json();
//         setRecipeIngredients(data);
//       } catch (error) {
//         console.error("Error fetching recipe ingredients:", error);
//         toast.error("Failed to load recipe ingredients. Please try again.");
//       }
//     };

//     if (recipe?.id) {
//       fetchRecipeIngredients(recipe.id);
//     } else {
//       setRecipeIngredients([]);
//     }
//   }, [recipe]);

//   // Populate form when editing
//   useEffect(() => {
//     if (recipe) {
//       form.reset({
//         name: recipe.name,
//         description: recipe.description || "",
//         category: recipe.category,
//         preparationTime: recipe.preparationTime || 0,
//         bakingTime: recipe.bakingTime || 0,
//         yieldQuantity: recipe.yieldQuantity,
//         instructions: recipe.instructions || "",
//         sellingPrice: recipe.sellingPrice,
//       });
//     } else {
//       form.reset({
//         name: "",
//         description: "",
//         category: "",
//         preparationTime: 0,
//         bakingTime: 0,
//         yieldQuantity: 1,
//         instructions: "",
//         sellingPrice: 0,
//       });
//       setRecipeIngredients([]);
//     }
//   }, [recipe, form]);

//   // Add ingredient to recipe
//   const handleAddIngredient = () => {
//     setRecipeIngredients([
//       ...recipeIngredients,
//       {
//         id: 0,
//         recipeId: recipe?.id || 0,
//         ingredientId: 0,
//         quantity: 0,
//         name: "",
//         unit: "",
//       },
//     ]);
//   };

//   // Remove ingredient from recipe
//   const handleRemoveIngredient = (index: number) => {
//     const updatedIngredients = [...recipeIngredients];
//     updatedIngredients.splice(index, 1);
//     setRecipeIngredients(updatedIngredients);
//   };

//   // Update ingredient details
//   const handleIngredientChange = (index: number, field: string, value: any) => {
//     const updatedIngredients = [...recipeIngredients];

//     if (field === "ingredientId") {
//       const selectedIngredient = ingredients.find(
//         (i) => i.id === Number(value)
//       );
//       if (selectedIngredient) {
//         updatedIngredients[index] = {
//           ...updatedIngredients[index],
//           ingredientId: Number(value),
//           name: selectedIngredient.name,
//           unit: selectedIngredient.unit,
//         };
//       }
//     } else {
//       updatedIngredients[index] = {
//         ...updatedIngredients[index],
//         [field]: field === "quantity" ? Number(value) : value,
//       };
//     }

//     setRecipeIngredients(updatedIngredients);
//   };

//   // Form submission
//   const onSubmit = async (data: RecipeFormValues) => {
//     // Validate ingredients
//     const hasInvalidIngredients = recipeIngredients.some(
//       (ing) => ing.ingredientId === 0 || ing.quantity <= 0
//     );

//     if (recipeIngredients.length === 0) {
//       toast.error("Please add at least one ingredient to the recipe");
//       return;
//     }

//     if (hasInvalidIngredients) {
//       toast.error(
//         "Please ensure all ingredients are selected and have valid quantities"
//       );
//       return;
//     }

//     // Prepare data for submission
//     const recipeData = {
//       ...data,
//       id: recipe?.id,
//       recipeIngredients: recipeIngredients.map((ing) => ({
//         ingredientId: ing.ingredientId,
//         quantity: ing.quantity,
//         id: ing.id > 0 ? ing.id : undefined,
//       })),
//     };

//     onSave(recipeData);
//   };

//   // Get list of available categories (normally would be from API)
//   const categories = ["Bread", "Pastry", "Cake", "Cookie", "Savory", "Other"];

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? "Edit Recipe" : "Add New Recipe"}
//           </DialogTitle>
//           <DialogDescription>
//             {isEditing
//               ? "Update recipe details and ingredients"
//               : "Create a new recipe for your bakery"}
//           </DialogDescription>
//         </DialogHeader>

//         <Form {...form}>
//           {/* Ingredients Section */}
//           <div className="space-y-4">
//             <div className="flex justify-between items-center">
//               <h3 className="font-medium text-lg">Recipe Ingredients</h3>
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="sm"
//                 onClick={handleAddIngredient}
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Ingredient
//               </Button>
//             </div>

//             {recipeIngredients.length === 0 ? (
//               <div className="text-sm text-muted-foreground p-4 text-center border rounded-md">
//                 No ingredients added yet. Click "Add Ingredient" to start.
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {recipeIngredients.map((ingredient, index) => (
//                   <div
//                     key={index}
//                     className="flex gap-3 items-end p-3 border rounded-md"
//                   >
//                     <div className="flex-1">
//                       <FormLabel className="text-xs">Ingredient</FormLabel>
//                       <Select
//                         value={ingredient.ingredientId.toString()}
//                         onValueChange={(value) =>
//                           handleIngredientChange(index, "ingredientId", value)
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select ingredient" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {ingredients.map((ing) => (
//                             <SelectItem key={ing.id} value={ing.id.toString()}>
//                               {ing.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="w-24">
//                       <FormLabel className="text-xs">Quantity</FormLabel>
//                       <Input
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         value={ingredient.quantity}
//                         onChange={(e) =>
//                           handleIngredientChange(
//                             index,
//                             "quantity",
//                             e.target.value
//                           )
//                         }
//                       />
//                     </div>

//                     <div className="w-20">
//                       <FormLabel className="text-xs">Unit</FormLabel>
//                       <Input type="text" value={ingredient.unit} disabled />
//                     </div>

//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => handleRemoveIngredient(index)}
//                       className="text-destructive"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem className="col-span-2">
//                     <FormLabel>Recipe Name</FormLabel>
//                     <FormControl>
//                       <Input {...field} placeholder="e.g. Sourdough Bread" />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="category"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Category</FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select category" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {categories.map((category) => (
//                           <SelectItem key={category} value={category}>
//                             {category}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="sellingPrice"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Selling Price</FormLabel>
//                     <FormControl>
//                       <Input type="number" step="0.01" min="0" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="preparationTime"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Preparation Time (min)</FormLabel>
//                     <FormControl>
//                       <Input type="number" min="0" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="bakingTime"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Baking Time (min)</FormLabel>
//                     <FormControl>
//                       <Input type="number" min="0" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="yieldQuantity"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Yield Quantity</FormLabel>
//                     <FormControl>
//                       <Input type="number" min="1" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem className="col-span-2">
//                     <FormLabel>Description</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder="Brief description of the recipe"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="instructions"
//                 render={({ field }) => (
//                   <FormItem className="col-span-2">
//                     <FormLabel>Instructions</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder="Detailed preparation instructions"
//                         className="min-h-[100px]"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <DialogFooter>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => onOpenChange(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={isLoading}>
//                 {isLoading
//                   ? "Saving..."
//                   : isEditing
//                   ? "Update Recipe"
//                   : "Create Recipe"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Trash2 } from "lucide-react";

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

export function RecipeDialog({
  open,
  onOpenChange,
  recipe,
  onSave,
}: RecipeDialogProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<
    (RecipeIngredient & { name: string; unit: string })[]
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

  // Fetch ingredients for select item UI
  useEffect(() => {
    const fetchIngredients = async () => {
      setLoadingIngredients(true);
      try {
        const response = await fetch("/api/ingredients");
        if (!response.ok) throw new Error("Failed to fetch ingredients");
        const data = await response.json();
        setIngredients(data);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
        toast.error("Failed to load ingredients. Please try again.");
      } finally {
        setLoadingIngredients(false);
      }
    };

    if (open) {
      fetchIngredients();
    }
  }, [open]);

  // Fetch recipe ingredients if editing
  useEffect(() => {
    const fetchRecipeIngredients = async (recipeId: number) => {
      setLoadingRecipeIngredients(true);
      try {
        const response = await fetch(`/api/recipes/${recipeId}/ingredients`);
        if (!response.ok) throw new Error("Failed to fetch recipe ingredients");
        const data = await response.json();
        setRecipeIngredients(data);
      } catch (error) {
        console.error("Error fetching recipe ingredients:", error);
        toast.error("Failed to load recipe ingredients. Please try again.");
      } finally {
        setLoadingRecipeIngredients(false);
      }
    };

    if (recipe?.id) {
      fetchRecipeIngredients(recipe.id);
    } else {
      setRecipeIngredients([]);
    }
  }, [recipe]);

  // Populate form when editing
  useEffect(() => {
    if (recipe) {
      form.reset({
        name: recipe.name,
        description: recipe.description || "",
        category: recipe.category,
        preparationTime: recipe.preparationTime || 0,
        bakingTime: recipe.bakingTime || 0,
        yieldQuantity: recipe.yieldQuantity,
        instructions: recipe.instructions || "",
        sellingPrice: recipe.sellingPrice,
      });
    } else {
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
      setRecipeIngredients([]);
    }
  }, [recipe, form]);

  // Add ingredient to recipe
  const handleAddIngredient = () => {
    setRecipeIngredients([
      ...recipeIngredients,
      {
        id: 0,
        recipeId: recipe?.id || 0,
        ingredientId: 0,
        quantity: 0,
        name: "",
        unit: "",
      },
    ]);
  };

  // Remove ingredient from recipe
  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...recipeIngredients];
    updatedIngredients.splice(index, 1);
    setRecipeIngredients(updatedIngredients);
  };

  // Update ingredient details
  const handleIngredientChange = (index: number, field: string, value: any) => {
    const updatedIngredients = [...recipeIngredients];

    if (field === "ingredientId") {
      const selectedIngredient = ingredients.find(
        (i) => i.id === Number(value)
      );
      if (selectedIngredient) {
        updatedIngredients[index] = {
          ...updatedIngredients[index],
          ingredientId: Number(value),
          name: selectedIngredient.name,
          unit: selectedIngredient.unit,
        };
      }
    } else {
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]: field === "quantity" ? Number(value) : value,
      };
    }

    setRecipeIngredients(updatedIngredients);
  };

  // Form submission
  const onSubmit = async (data: RecipeFormValues) => {
    // Validate ingredients
    const hasInvalidIngredients = recipeIngredients.some(
      (ing) => ing.ingredientId === 0 || ing.quantity <= 0
    );

    if (recipeIngredients.length === 0) {
      toast.error("Please add at least one ingredient to the recipe");
      return;
    }

    if (hasInvalidIngredients) {
      toast.error(
        "Please ensure all ingredients are selected and have valid quantities"
      );
      return;
    }

    // Prepare data for submission
    const recipeData = {
      ...data,
      id: recipe?.id,
      recipeIngredients: recipeIngredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        quantity: ing.quantity,
        id: ing.id > 0 ? ing.id : undefined,
      })),
    };

    setIsLoading(true);
    try {
      await onSave(recipeData);
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
          {/* Ingredients Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg">Recipe Ingredients</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddIngredient}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>

            {loadingIngredients || loadingRecipeIngredients ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recipeIngredients.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 text-center border rounded-md">
                No ingredients added yet. Click "Add Ingredient" to start.
              </div>
            ) : (
              <div className="space-y-3">
                {recipeIngredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-end p-3 border rounded-md"
                  >
                    <div className="flex-1">
                      <FormLabel className="text-xs">Ingredient</FormLabel>
                      <Select
                        value={ingredient.ingredientId.toString()}
                        onValueChange={(value) =>
                          handleIngredientChange(index, "ingredientId", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ingredient" />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredients.map((ing) => (
                            <SelectItem key={ing.id} value={ing.id.toString()}>
                              {ing.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-24">
                      <FormLabel className="text-xs">Quantity</FormLabel>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          handleIngredientChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="w-20">
                      <FormLabel className="text-xs">Unit</FormLabel>
                      <Input type="text" value={ingredient.unit} disabled />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveIngredient(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-6"
          >
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormLabel>Selling Price</FormLabel>
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
                    <FormLabel>Preparation Time (min)</FormLabel>
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
                    <FormLabel>Baking Time (min)</FormLabel>
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
                      <Input type="number" min="1" {...field} />
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
                        placeholder="Brief description of the recipe"
                        {...field}
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
                        placeholder="Detailed preparation instructions"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
