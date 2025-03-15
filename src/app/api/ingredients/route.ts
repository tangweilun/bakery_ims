// app/api/ingredients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const prisma = new PrismaClient();

// Input validation schema using Zod
const ingredientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  currentStock: z.number().nonnegative("Current stock must be non-negative"),
  minimumStock: z.number().nonnegative("Minimum stock must be non-negative"),
  idealStock: z.number().nonnegative("Ideal stock must be non-negative"),
  cost: z.number().positive("Cost must be positive"),
  supplierId: z.number().optional().nullable(),
});

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

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found in system",
        },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();

    // Validate input data
    const validationResult = ingredientSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if ingredient with same name already exists
    const existingIngredient = await prisma.ingredient.findUnique({
      where: { name: data.name },
    });

    if (existingIngredient) {
      return NextResponse.json(
        {
          success: false,
          error: "Ingredient with this name already exists",
        },
        { status: 409 }
      );
    }

    // If supplierId is provided, verify it exists
    if (data.supplierId) {
      const supplierExists = await prisma.supplier.findUnique({
        where: { id: data.supplierId },
      });

      if (!supplierExists) {
        return NextResponse.json(
          {
            success: false,
            error: "Supplier not found",
          },
          { status: 404 }
        );
      }
    }

    // Create the ingredient
    const ingredient = await prisma.ingredient.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        unit: data.unit,
        currentStock: data.currentStock,
        minimumStock: data.minimumStock,
        idealStock: data.idealStock,
        cost: data.cost,
        supplierId: data.supplierId || null,
      },
    });

    // Log the activity with the actual userId
    await prisma.activity.create({
      data: {
        action: "INGREDIENT_ADDED",
        description: `New ingredient '${ingredient.name}' added`,
        details: JSON.stringify(ingredient),
        userId: Number(user.id),
        ingredientId: ingredient.id,
      },
    });

    // Check if the ingredient is below minimum stock and create an alert if needed
    if (ingredient.currentStock < ingredient.minimumStock) {
      await prisma.lowStockAlert.create({
        data: {
          ingredientId: ingredient.id,
          threshold: ingredient.minimumStock,
          currentLevel: ingredient.currentStock,
          status: "PENDING",
          notes: "Alert automatically generated on ingredient creation",
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: ingredient,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding ingredient:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add ingredient",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
