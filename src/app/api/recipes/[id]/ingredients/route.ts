import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/recipes/[id]/ingredients - Get ingredients for a recipe
export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params; // Await the params Promise
    const { id } = params; // Now safely destructure id
    const recipeId = parseInt(id);
    if (isNaN(recipeId)) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 });
    }

    // Get recipe ingredients with ingredient details
    const recipeIngredients = await prisma.recipeIngredient.findMany({
      where: { recipeId },
      include: {
        ingredient: true,
      },
    });

    // Format response to include ingredient name and unit
    const formattedIngredients = recipeIngredients.map((ri) => ({
      id: ri.id,
      recipeId: ri.recipeId,
      ingredientId: ri.ingredientId,
      quantity: ri.quantity,
      name: ri.ingredient.name,
      unit: ri.ingredient.unit,
    }));

    return NextResponse.json(formattedIngredients);
  } catch (error) {
    console.error("Error fetching recipe ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe ingredients" },
      { status: 500 }
    );
  }
}
