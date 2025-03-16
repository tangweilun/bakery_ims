import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// POST record a new restock
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate request
    if (!data.ingredientId || !data.quantity || !data.userId) {
      return NextResponse.json(
        { error: "Missing required fields: ingredientId, quantity, userId" },
        { status: 400 }
      );
    }

    // Start a transaction for data consistency
    return await prisma.$transaction(async (tx) => {
      // Get the current ingredient
      const ingredient = await tx.ingredient.findUnique({
        where: { id: data.ingredientId },
      });

      if (!ingredient) {
        return NextResponse.json(
          { error: "Ingredient not found" },
          { status: 404 }
        );
      }

      // Create restock history record
      const restockHistory = await tx.restockHistory.create({
        data: {
          ingredientId: data.ingredientId,
          supplierId: data.supplierId,
          quantity: data.quantity,
          cost: data.cost || ingredient.cost * data.quantity,
          invoiceNumber: data.invoiceNumber,
          notes: data.notes,
          userId: data.userId,
        },
      });

      // Create a new batch if necessary
      let batch = null;
      if (data.createBatch) {
        batch = await tx.batch.create({
          data: {
            batchNumber: data.batchNumber || `B-${Date.now()}`,
            ingredientId: data.ingredientId,
            quantity: data.quantity,
            remainingQuantity: data.quantity,
            cost: data.cost || ingredient.cost * data.quantity,
            expiryDate: data.expiryDate,
            location: data.location,
            notes: data.notes,
            restockHistoryId: restockHistory.id,
          },
        });
      }

      // Update ingredient stock level
      const updatedIngredient = await tx.ingredient.update({
        where: { id: data.ingredientId },
        data: {
          currentStock: { increment: data.quantity },
        },
      });

      // Log the activity
      await tx.activity.create({
        data: {
          action: "INGREDIENT_RESTOCKED",
          description: `Restocked ${data.quantity} ${ingredient.unit} of ${ingredient.name}`,
          userId: data.userId,
          ingredientId: data.ingredientId,
          restockHistoryId: restockHistory.id,
          batchId: batch?.id,
        },
      });

      // Resolve any low stock alerts if stock level is now adequate
      if (updatedIngredient.currentStock > updatedIngredient.minimumStock) {
        await tx.lowStockAlert.updateMany({
          where: {
            ingredientId: data.ingredientId,
            status: {
              in: ["PENDING", "ACKNOWLEDGED"],
            },
          },
          data: {
            status: "RESOLVED",
            notes: `${
              data.notes ? data.notes + " - " : ""
            }Resolved automatically after restock`,
          },
        });
      }

      return NextResponse.json(
        {
          restockHistory,
          batch,
          updatedStock: updatedIngredient.currentStock,
        },
        { status: 201 }
      );
    });
  } catch (error) {
    console.error("Error restocking ingredient:", error);
    return NextResponse.json(
      { error: "Failed to record restock" },
      { status: 500 }
    );
  }
}

// GET a single ingredient by ID
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
      where: { id: ingredientId },
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
