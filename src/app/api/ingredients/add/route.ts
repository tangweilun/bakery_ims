// app/api/inventory/ingredients/route.ts
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
    if (
      !data.name ||
      !data.category ||
      !data.unit ||
      data.currentStock === undefined ||
      data.cost === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new ingredient
    const ingredient = await prisma.ingredient.create({
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category,
        unit: data.unit,
        currentStock: parseFloat(data.currentStock),
        minimumStock: parseFloat(data.minimumStock || 0),
        idealStock: parseFloat(data.idealStock || 0),
        cost: parseFloat(data.cost),
        supplierId: data.supplierId || null,
      },
    });

    // Create activity log entry
    await prisma.activity.create({
      data: {
        action: "INGREDIENT_ADDED",
        description: `${dbUser.name || dbUser.email} added new ingredient: ${
          data.name
        }`,
        details: JSON.stringify(ingredient),
        userId: dbUser.id,
        ingredientId: ingredient.id,
      },
    });

    // If initial stock is provided, also create a batch
    if (data.currentStock > 0) {
      const batch = await prisma.batch.create({
        data: {
          batchNumber: `INIT-${ingredient.id}-${Date.now()}`,
          ingredientId: ingredient.id,
          quantity: parseFloat(data.currentStock),
          remainingQuantity: parseFloat(data.currentStock),
          cost: parseFloat(data.cost) * parseFloat(data.currentStock),
          expiryDate: data.expiryDate || null,
          location: data.location || null,
          notes: "Initial inventory batch",
        },
      });

      // Create restock history record
      const restock = await prisma.restockHistory.create({
        data: {
          ingredientId: ingredient.id,
          supplierId: data.supplierId || null,
          quantity: parseFloat(data.currentStock),
          cost: parseFloat(data.cost) * parseFloat(data.currentStock),
          notes: "Initial inventory",
          userId: dbUser.id,
        },
      });

      // Link batch to restock history
      await prisma.batch.update({
        where: { id: batch.id },
        data: { restockHistoryId: restock.id },
      });

      // Create activity for batch creation
      await prisma.activity.create({
        data: {
          action: "BATCH_CREATED",
          description: `Initial batch created for ${data.name}`,
          userId: dbUser.id,
          batchId: batch.id,
          ingredientId: ingredient.id,
        },
      });

      // Check if we need to create low stock alert
      if (data.currentStock < parseFloat(data.minimumStock || 0)) {
        const alert = await prisma.lowStockAlert.create({
          data: {
            ingredientId: ingredient.id,
            threshold: parseFloat(data.minimumStock || 0),
            currentLevel: parseFloat(data.currentStock),
            status: "PENDING",
            notes: "Ingredient added with stock below minimum threshold",
          },
        });

        await prisma.activity.create({
          data: {
            action: "ALERT_GENERATED",
            description: `Low stock alert for ${data.name}`,
            userId: dbUser.id,
            lowStockAlertId: alert.id,
            ingredientId: ingredient.id,
          },
        });
      }
    }

    return NextResponse.json(
      { message: "Ingredient added successfully", ingredient },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding ingredient:", error);
    return NextResponse.json(
      { error: "Failed to add ingredient" },
      { status: 500 }
    );
  }
}

// Get all ingredients
export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      include: {
        supplier: true,
        batches: {
          where: {
            remainingQuantity: { gt: 0 },
            expiryDate: { gt: new Date() },
          },
        },
      },
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  }
}
