import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Prisma } from "@prisma/client";

// PATCH update an ingredient
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
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

// DELETE an ingredient (isActive false since cascade deleting is not approiate)
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params; // Ensure params is awaited before using it
    const ingredientId = await parseInt(id, 10); // Convert ID to integer

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

    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    // Execute transaction for deletion and activity logging
    await prisma.$transaction(async (tx) => {
      // Delete ingredient
      await tx.ingredient.update({
        where: { id: ingredientId },
        data: { isActive: false },
      });

      // Log the deletion in activity
      await tx.activity.create({
        data: {
          action: "INGREDIENT_DELETED",
          description: `Deleted ingredient: ${ingredient.name}`,
          userId: user.id,
          ingredientId: ingredient.id,
        },
      });
    });

    return NextResponse.json({ message: "Ingredient deleted successfully" });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
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
      { error: "Failed to delete ingredient" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Properly await params before using them
    const { id } = await context.params;
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
