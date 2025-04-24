import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Define type for recipe ingredient
interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
}

// GET /api/recipes - Get all recipes
export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}

// POST /api/recipes - Create a new recipe
export async function POST(request: NextRequest) {
  try {
    // Create Supabase server client
    const supabase = await createClient();

    // Get user session from Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if user is authenticated
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { recipeIngredients, ...recipeData } = data;

    // Validate required fields
    if (
      !recipeData.name ||
      !recipeData.category ||
      recipeData.yieldQuantity < 1
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create recipe transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create recipe
      const recipe = await tx.recipe.create({
        data: recipeData,
      });

      // Create recipe ingredients
      if (recipeIngredients && recipeIngredients.length > 0) {
        await tx.recipeIngredient.createMany({
          data: recipeIngredients.map((item: RecipeIngredient) => ({
            recipeId: recipe.id,
            ingredientId: item.ingredientId,
            quantity: item.quantity,
          })),
        });
      }

      // Log activity
      await tx.activity.create({
        data: {
          action: "RECIPE_CREATED",
          description: `Recipe "${recipe.name}" was created`,
          userId: user.id,
          recipeId: recipe.id,
        },
      });

      return recipe;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}
