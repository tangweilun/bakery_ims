import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/recipes/[id] - Get recipe by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const recipeId = parseInt(id);
    if (isNaN(recipeId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

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
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    );
  }
}

// PATCH /api/recipes/[id] - Update recipe
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const { id } = context.params;
    const recipeId = parseInt(id);

    if (isNaN(recipeId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const data = await request.json();
    const { recipeIngredients, ...recipeData } = data;

    // Update recipe transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update recipe basic info
      const updatedRecipe = await tx.recipe.update({
        where: { id: recipeId },
        data: recipeData,
      });

      // Handle recipe ingredients
      if (recipeIngredients && Array.isArray(recipeIngredients)) {
        // Get current recipe ingredients
        const currentIngredients = await tx.recipeIngredient.findMany({
          where: { recipeId: recipeId },
        });

        // Find ingredients to delete (not in the updated list)
        const updatedIngredientIds = recipeIngredients
          .filter((ing) => ing.id)
          .map((ing) => ing.id);

        const ingredientsToDelete = currentIngredients
          .filter((ing) => !updatedIngredientIds.includes(ing.id))
          .map((ing) => ing.id);

        // Delete removed ingredients
        if (ingredientsToDelete.length > 0) {
          await tx.recipeIngredient.deleteMany({
            where: {
              id: { in: ingredientsToDelete },
            },
          });
        }

        // Update existing ingredients and create new ones
        for (const ingredient of recipeIngredients) {
          if (ingredient.id) {
            // Update existing ingredient
            await tx.recipeIngredient.update({
              where: {
                recipeId_ingredientId: {
                  recipeId: recipeId,
                  ingredientId: ingredient.ingredientId,
                },
              },
              data: {
                quantity: ingredient.quantity,
                ingredientId: ingredient.ingredientId,
              },
            });
          } else {
            // Create new ingredient
            await tx.recipeIngredient.create({
              data: {
                recipeId: recipeId,
                ingredientId: ingredient.ingredientId,
                quantity: ingredient.quantity,
              },
            });
          }
        }
      }

      // Log activity
      await tx.activity.create({
        data: {
          action: "RECIPE_UPDATED",
          description: `Recipe "${updatedRecipe.name}" was updated`,
          userId: user.id,
          recipeId: recipeId,
        },
      });

      return updatedRecipe;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/[id] - Delete recipe
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const recipeId = parseInt(id);
    // Create Supabase server client
    const supabase = await createClient();

    // Get user session from Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (isNaN(recipeId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Check if recipe exists and get name for activity log
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Delete recipe transaction
    await prisma.$transaction(async (tx) => {
      // First delete all recipe ingredients
      await tx.recipeIngredient.deleteMany({
        where: { recipeId: recipeId },
      });

      // Delete the recipe
      await tx.recipe.delete({
        where: { id: recipeId },
      });

      // Log activity
      await tx.activity.create({
        data: {
          action: "RECIPE_DELETED",
          description: `Recipe "${recipe.name}" was deleted`,
          userId: user.id,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
