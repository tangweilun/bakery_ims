import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/recipes/[id] - Get recipe by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params; // Await the params Promise
    const { id } = params; // Now safely destructure id
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
  context: { params: Promise<{ id: string }> }
) {
  console.log("--- PATCH /api/recipes/[id] ---"); // Log start
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
    const params = await context.params; // Await the params Promise
    const { id } = params; // Now safely destructure id
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

    // --- LOGGING: Data received from frontend ---
    console.log("Recipe data received:", JSON.stringify(recipeData, null, 2));
    console.log(
      "Recipe ingredients received:",
      JSON.stringify(recipeIngredients, null, 2)
    );
    // --- END LOGGING ---

    // Update recipe transaction
    const result = await prisma.$transaction(async (tx) => {
      console.log("--- Transaction started ---");
      // Update recipe basic info
      const updatedRecipe = await tx.recipe.update({
        where: { id: recipeId },
        data: recipeData,
      });
      console.log("Recipe basic info updated, ID:", updatedRecipe.id);

      // Handle recipe ingredients
      if (recipeIngredients && Array.isArray(recipeIngredients)) {
        // Get current recipe ingredients from DB
        const currentIngredients = await tx.recipeIngredient.findMany({
          where: { recipeId: recipeId },
          select: { id: true, ingredientId: true }, // Select only needed fields
        });
        // --- LOGGING: Current ingredients in DB ---
        console.log(
          "Current ingredients in DB:",
          JSON.stringify(currentIngredients, null, 2)
        );
        // --- END LOGGING ---

        // Find ingredients to delete (not in the updated list)
        const updatedIngredientIdsWithPk = recipeIngredients
          .filter((ing) => ing && typeof ing.id === "number" && ing.id > 0) // Ensure ing.id is a valid PK
          .map((ing) => ing.id);

        // --- LOGGING: IDs from frontend to keep/update ---
        console.log(
          "Frontend ingredient PKs to keep/update:",
          JSON.stringify(updatedIngredientIdsWithPk, null, 2)
        );
        // --- END LOGGING ---

        const ingredientsToDelete = currentIngredients
          .filter((dbIng) => !updatedIngredientIdsWithPk.includes(dbIng.id)) // If current DB PK is NOT in the list from frontend...
          .map((dbIng) => dbIng.id); // ...mark its PK for deletion.

        // --- LOGGING: IDs calculated for deletion ---
        console.log(
          "RecipeIngredient PKs to DELETE:",
          JSON.stringify(ingredientsToDelete, null, 2)
        );
        // --- END LOGGING ---

        // Delete removed ingredients
        if (ingredientsToDelete.length > 0) {
          console.log(
            `Attempting to delete ${ingredientsToDelete.length} recipe ingredients...`
          );
          await tx.recipeIngredient.deleteMany({
            where: {
              id: { in: ingredientsToDelete },
            },
          });
          console.log("Deletion successful.");
        }

        // Update existing ingredients and create new ones
        console.log("--- Processing ingredients for update/create ---");
        for (const ingredient of recipeIngredients) {
          console.log(
            "Processing ingredient from frontend:",
            JSON.stringify(ingredient, null, 2)
          );

          if (
            !ingredient ||
            typeof ingredient.ingredientId !== "number" ||
            typeof ingredient.quantity !== "number"
          ) {
            console.warn("Skipping invalid ingredient data:", ingredient);
            continue;
          }

          // Check if frontend provided an ID AND if that ID actually existed in the DB for this recipe initially
          const isExistingAndValid =
            ingredient.id &&
            ingredient.id > 0 &&
            currentIngredients.some((dbIng) => dbIng.id === ingredient.id);

          if (isExistingAndValid) {
            // --- UPDATE block ---
            console.log(
              `Attempting to UPDATE RecipeIngredient with PK: ${ingredient.id}`
            );
            try {
              await tx.recipeIngredient.update({
                where: {
                  id: ingredient.id,
                  // recipeId: recipeId, // Optional constraint
                },
                data: {
                  quantity: ingredient.quantity,
                  ingredientId: ingredient.ingredientId, // Allow changing the ingredient itself
                },
              });
              console.log(`UPDATE successful for PK: ${ingredient.id}`);
            } catch (updateError) {
              console.error(
                `UPDATE FAILED for PK: ${ingredient.id}`,
                updateError
              );
              throw updateError; // Rollback transaction on update failure
            }
          } else {
            // --- CREATE block (or handle stale ID) ---
            if (ingredient.id && ingredient.id > 0) {
              // ID was provided but wasn't valid for this recipe initially
              console.warn(
                `Frontend provided PK ${ingredient.id}, but it was not found for recipe ${recipeId}. Treating as potential create.`
              );
            } else {
              // No ID provided, definitely a create attempt
              console.log(
                `Attempting to CREATE new RecipeIngredient for ingredientId: ${ingredient.ingredientId}`
              );
            }

            // Check if this ingredientId is already linked to the recipe (prevent duplicates)
            const existingLink = await tx.recipeIngredient.findUnique({
              where: {
                recipeId_ingredientId: {
                  recipeId: recipeId,
                  ingredientId: ingredient.ingredientId,
                },
              },
            });

            if (!existingLink) {
              // Safe to create
              await tx.recipeIngredient.create({
                data: {
                  recipeId: recipeId,
                  ingredientId: ingredient.ingredientId,
                  quantity: ingredient.quantity,
                },
              });
              console.log(
                `CREATE successful for ingredientId: ${ingredient.ingredientId}`
              );
            } else {
              // Ingredient link already exists. Decide what to do.
              // Option 1: Warn and skip (safest to avoid accidental updates)
              console.warn(
                `Ingredient ${ingredient.ingredientId} already linked to recipe ${recipeId} (Link ID: ${existingLink.id}). Skipping creation/update for this item.`
              );
              // Option 2: Update the existing link's quantity (if that's desired behavior)
              // console.log(`Updating quantity for existing link ID: ${existingLink.id}`);
              // await tx.recipeIngredient.update({
              //   where: { id: existingLink.id },
              //   data: { quantity: ingredient.quantity }
              // });
            }
          }
        }
        console.log("--- Finished processing ingredients ---");
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

      console.log("--- Transaction committing ---");
      return updatedRecipe;
    }); // --- End of Transaction ---

    console.log("--- PATCH request successful ---");
    return NextResponse.json(result);
  } catch (error) {
    // --- LOGGING: Error caught ---
    console.error("Error updating recipe:", error);
    // --- END LOGGING ---
    return NextResponse.json(
      // Provide more context in error response if possible
      {
        error: "Failed to update recipe",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/[id] - Delete recipe
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
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
