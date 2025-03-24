import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Prisma } from "@prisma/client";

// PATCH update an ingredient
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params; // Await the params Promise
    const { id } = params; // Now safely destructure id
    const ingredientId = parseInt(id);

    const data = await request.json();
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

    if (isNaN(ingredientId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const existingIngredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!existingIngredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    const updatedIngredient = await prisma.$transaction(async (tx) => {
      // Update ingredient
      const ingredient = await tx.ingredient.update({
        where: { id: ingredientId },
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          unit: data.unit,
          minimumStock: data.minimumStock,
          idealStock: data.idealStock,
          cost: data.cost,
          supplierId: data.supplierId,
        },
      });

      // Log the Update in activity
      await tx.activity.create({
        data: {
          action: "INGREDIENT_UPDATED",
          description: `Updated ingredient: ${ingredient.name}`,
          userId: user.id,
          ingredientId: ingredient.id,
        },
      });

      // Handle low stock alerts
      if (ingredient.currentStock <= ingredient.minimumStock) {
        const existingAlert = await tx.lowStockAlert.findFirst({
          where: {
            ingredientId: ingredientId,
            status: { in: ["PENDING", "ACKNOWLEDGED"] },
          },
        });

        if (!existingAlert) {
          await tx.lowStockAlert.create({
            data: {
              ingredientId: ingredientId,
              threshold: ingredient.minimumStock,
              currentLevel: ingredient.currentStock,
              status: "PENDING",
              notes: "Generated after ingredient update",
            },
          });
        }
      }

      return ingredient;
    });

    return NextResponse.json(updatedIngredient);
  } catch (error) {
    console.error("Error updating ingredient:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "An ingredient with this name already exists" },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to update ingredient" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const ingredientId = parseInt(id);

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

    if (isNaN(ingredientId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // First check if the ingredient exists
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
      include: {
        // Include counts of related records to check dependencies
        batches: {
          select: { id: true },
          where: { remainingQuantity: { gt: 0 } },
        },
        recipeIngredients: { select: { id: true } },
        usageRecords: { select: { id: true } },
      },
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    // Check if ingredient has active relationships that prevent deletion
    const hasActiveBatches = ingredient.batches.length > 0;
    const isUsedInRecipes = ingredient.recipeIngredients.length > 0;
    const hasUsageRecords = ingredient.usageRecords.length > 0;

    if (hasActiveBatches || isUsedInRecipes || hasUsageRecords) {
      // Construct detailed error message
      const dependenciesDetails = [];
      if (hasActiveBatches)
        dependenciesDetails.push(`${ingredient.batches.length} active batches`);
      if (isUsedInRecipes)
        dependenciesDetails.push(
          `${ingredient.recipeIngredients.length} recipes`
        );
      if (hasUsageRecords)
        dependenciesDetails.push(
          `${ingredient.usageRecords.length} usage records`
        );

      return NextResponse.json(
        {
          error: `Cannot delete ingredient as it has active relationships. This ingredient is referenced in: ${dependenciesDetails.join(
            ", "
          )}.`,
          details: `This ingredient is referenced in: ${dependenciesDetails.join(
            ", "
          )}. Consider marking it as inactive instead.`,
          canMarkInactive: true,
        },
        { status: 409 }
      );
    }

    // If no relationships prevent deletion, proceed with soft delete
    await prisma.$transaction(async (tx) => {
      // Soft delete ingredient
      await tx.ingredient.update({
        where: { id: ingredientId },
        data: { isActive: false },
      });

      // Log the action in activity
      await tx.activity.create({
        data: {
          action: "INGREDIENT_MARKED_INACTIVE",
          description: `Marked ingredient as inactive: ${ingredient.name}`,
          userId: user.id,
          ingredientId: ingredient.id,
        },
      });
    });

    return NextResponse.json({
      message: "Ingredient marked as inactive successfully",
      ingredientName: ingredient.name,
    });
  } catch (error) {
    console.error("Error handling ingredient deletion:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "Cannot delete ingredient as it is referenced by other records. Consider marking it as inactive instead.",
          },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to process ingredient deletion request" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params; // Await the params Promise
    const { id } = params; // Now safely destructure id
    const ingredientId = parseInt(id);

    if (isNaN(ingredientId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId, isActive: true },
      include: {
        supplier: true,
        batches: {
          orderBy: {
            expiryDate: "asc",
          },
        },
        lowStockAlerts: {
          where: {
            status: {
              in: ["PENDING", "ACKNOWLEDGED"],
            },
          },
        },
      },
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredient" },
      { status: 500 }
    );
  }
}
