import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = await createClient();

    // Get current user from Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get the DB user record
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email as string },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in system" },
        { status: 404 }
      );
    }

    // Parse the request body
    const data = await request.json();

    // Validate required fields
    if (!data.ingredientId || !data.quantity || !data.cost) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: ingredientId, quantity, and cost are required",
        },
        { status: 400 }
      );
    }

    // Get the ingredient to update
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: data.ingredientId },
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // Create restock history record
      const restock = await prisma.restockHistory.create({
        data: {
          ingredientId: data.ingredientId,
          supplierId: data.supplierId || null,
          quantity: parseFloat(data.quantity),
          cost: parseFloat(data.cost),
          invoiceNumber: data.invoiceNumber || null,
          notes: data.notes || null,
          userId: dbUser.id,
        },
      });

      // Create a new batch
      const batch = await prisma.batch.create({
        data: {
          batchNumber: `BATCH-${data.ingredientId}-${Date.now()}`,
          ingredientId: data.ingredientId,
          quantity: parseFloat(data.quantity),
          remainingQuantity: parseFloat(data.quantity),
          cost: parseFloat(data.cost),
          expiryDate: data.expiryDate || null,
          receivedDate: new Date(),
          location: data.location || null,
          notes: data.notes || null,
          restockHistoryId: restock.id,
        },
      });

      // Update ingredient current stock
      const updatedIngredient = await prisma.ingredient.update({
        where: { id: data.ingredientId },
        data: {
          currentStock: { increment: parseFloat(data.quantity) },
          // Update the cost to weighted average of existing and new cost
          cost:
            (ingredient.currentStock * ingredient.cost +
              parseFloat(data.quantity) * parseFloat(data.cost)) /
            (ingredient.currentStock + parseFloat(data.quantity)),
        },
      });

      // Create activity for restocking
      const activity = await prisma.activity.create({
        data: {
          action: "INGREDIENT_RESTOCKED",
          description: `${dbUser.name || dbUser.email} restocked ${
            ingredient.name
          } (+${data.quantity} ${ingredient.unit})`,
          userId: dbUser.id,
          ingredientId: data.ingredientId,
          restockHistoryId: restock.id,
          batchId: batch.id,
        },
      });

      // Check if there was a pending low stock alert that can be resolved
      const pendingAlerts = await prisma.lowStockAlert.findMany({
        where: {
          ingredientId: data.ingredientId,
          status: "PENDING",
        },
      });

      // Resolve alerts if stock is now above threshold
      for (const alert of pendingAlerts) {
        if (updatedIngredient.currentStock >= ingredient.minimumStock) {
          await prisma.lowStockAlert.update({
            where: { id: alert.id },
            data: { status: "RESOLVED" },
          });

          await prisma.activity.create({
            data: {
              action: "ALERT_RESOLVED",
              description: `Low stock alert for ${ingredient.name} resolved after restock`,
              userId: dbUser.id,
              lowStockAlertId: alert.id,
              ingredientId: data.ingredientId,
            },
          });
        }
      }

      return { restock, batch, updatedIngredient };
    });

    return NextResponse.json(
      {
        message: "Ingredient restocked successfully",
        restock: result.restock,
        batch: result.batch,
        ingredient: result.updatedIngredient,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error restocking ingredient:", error);
    return NextResponse.json(
      { error: "Failed to restock ingredient" },
      { status: 500 }
    );
  }
}
