import { NextRequest, NextResponse } from "next/server";
import { ingredientRequirementsService } from "@/lib/services/ingredientRequirementsService";

export async function POST(request: NextRequest) {
  try {
    console.log("[DEBUG] Ingredient requirements API called");
    const body = await request.json();
    const { recipeId, forecastQuantity } = body;
    
    console.log("[DEBUG] Request body:", { recipeId, forecastQuantity });

    // Validate input
    if (!recipeId || typeof recipeId !== "number") {
      console.log("[DEBUG] Invalid recipeId:", recipeId);
      return NextResponse.json(
        { error: "Recipe ID is required and must be a number" },
        { status: 400 }
      );
    }

    if (!forecastQuantity || typeof forecastQuantity !== "number") {
      console.log("[DEBUG] Invalid forecastQuantity:", forecastQuantity);
      return NextResponse.json(
        { error: "Forecast quantity is required and must be a number" },
        { status: 400 }
      );
    }

    console.log("[DEBUG] Calculating requirements for recipeId:", recipeId, "quantity:", forecastQuantity);
    
    // Calculate ingredient requirements
    const requirements = await ingredientRequirementsService.calculateRequirements(
      recipeId,
      forecastQuantity
    );
    
    console.log("[DEBUG] Requirements calculated:", requirements.length, "ingredients found");

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error("[DEBUG] Error in ingredient requirements API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}