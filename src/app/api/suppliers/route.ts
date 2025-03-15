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

    // Get user email
    const userEmail = user.email || "unknown@email.com";

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

    // Try to find internal user ID that maps to Supabase ID
    let internalUserId = null;
    try {
      // Assuming there's a user table with authId -> id mapping
      const dbUser = await prisma.user.findFirst({
        where: { authId: user.id },
        select: { id: true }
      });
      
      if (dbUser) {
        internalUserId = dbUser.id;
      }
    } catch (e) {
      console.warn("Could not fetch internal user ID, continuing without it");
    }

    // Use a transaction to ensure all database operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Check if ingredient with same name already exists
      const existingIngredient = await tx.ingredient.findUnique({
        where: { name: data.name },
      });

      if (existingIngredient) {
        throw new Error("Ingredient with this name already exists");
      }

      // If supplierId is provided, verify it exists
      if (data.supplierId) {
        const supplierExists = await tx.supplier.findUnique({
          where: { id: data.supplierId },
        });

        if (!supplierExists) {
          throw new Error("Supplier not found");
        }
      }

      // Create the ingredient
      const ingredient = await tx.ingredient.create({
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

      // Create activity record with user information in description only
      // Omit userId from data to avoid the type mismatch error
      const activityData: any = {
        action: "INGREDIENT_ADDED",
        description: `New ingredient '${ingredient.name}' added by ${userEmail}`,
        details: JSON.stringify({
          ...ingredient,
          addedByUserEmail: userEmail,
          addedByUserId: user.id
        }),
        ingredientId: ingredient.id,
      };
      
      // Only include userId if we have a valid internal ID
      if (internalUserId !== null) {
        activityData.userId = internalUserId;
      }
      
      await tx.activity.create({
        data: activityData
      });

      // Check if the ingredient is below minimum stock and create an alert if needed
      if (ingredient.currentStock < ingredient.minimumStock) {
        await tx.lowStockAlert.create({
          data: {
            ingredientId: ingredient.id,
            threshold: ingredient.minimumStock,
            currentLevel: ingredient.currentStock,
            status: "PENDING",
            notes: `Alert automatically generated on ingredient creation by ${userEmail}`,
          },
        });
      }

      return ingredient;
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding ingredient:", error);
    
    // Handle specific errors with appropriate status codes
    if (error instanceof Error) {
      if (error.message === "Ingredient with this name already exists") {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 409 }
        );
      } else if (error.message === "Supplier not found") {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 404 }
        );
      }
    }
    
    // Generic error response
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