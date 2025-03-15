import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";

// Create a single PrismaClient instance and reuse it across requests
// This prevents connection pool exhaustion in serverless environments
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

    // Use a transaction to ensure all database operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create new ingredient
      const ingredient = await tx.ingredient.create({
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
      await tx.activity.create({
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
      if (parseFloat(data.currentStock) > 0) {
        // Create restock history record first
        const restock = await tx.restockHistory.create({
          data: {
            ingredientId: ingredient.id,
            supplierId: data.supplierId || null,
            quantity: parseFloat(data.currentStock),
            cost: parseFloat(data.cost) * parseFloat(data.currentStock),
            notes: "Initial inventory",
            userId: dbUser.id,
          },
        });

        // Then create batch linked to the restock history
        const batch = await tx.batch.create({
          data: {
            batchNumber: `INIT-${ingredient.id}-${Date.now()}`,
            ingredientId: ingredient.id,
            quantity: parseFloat(data.currentStock),
            remainingQuantity: parseFloat(data.currentStock),
            cost: parseFloat(data.cost) * parseFloat(data.currentStock),
            expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
            location: data.location || null,
            notes: "Initial inventory batch",
            restockHistoryId: restock.id, // Link directly during creation
          },
        });

        // Create activity for batch creation
        await tx.activity.create({
          data: {
            action: "BATCH_CREATED",
            description: `Initial batch created for ${data.name}`,
            userId: dbUser.id,
            batchId: batch.id,
            ingredientId: ingredient.id,
          },
        });

        // Check if we need to create low stock alert
        if (
          parseFloat(data.currentStock) < parseFloat(data.minimumStock || 0)
        ) {
          const alert = await tx.lowStockAlert.create({
            data: {
              ingredientId: ingredient.id,
              threshold: parseFloat(data.minimumStock || 0),
              currentLevel: parseFloat(data.currentStock),
              status: "PENDING",
              notes: "Ingredient added with stock below minimum threshold",
            },
          });

          await tx.activity.create({
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

      return ingredient;
    });

    return NextResponse.json(
      { message: "Ingredient added successfully", ingredient: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding ingredient:", error);
    return NextResponse.json(
      {
        error: `Failed to add ingredient: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
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
            AND: [
              {
                OR: [{ expiryDate: null }, { expiryDate: { gt: new Date() } }],
              },
            ],
          },
        },
        lowStockAlerts: {
          where: {
            status: "PENDING",
          },
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch ingredients: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 }
    );
  }
}
