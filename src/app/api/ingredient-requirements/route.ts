import { NextRequest, NextResponse } from "next/server";
import { ingredientRequirementsService } from "@/lib/services/ingredientRequirementsService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeId, forecastQuantity } = body;

    // Validate input
    if (!recipeId || typeof recipeId !== "number") {
      return NextResponse.json(
        { error: "Recipe ID is required and must be a number" },
        { status: 400 }
      );
    }

    if (!forecastQuantity || typeof forecastQuantity !== "number") {
      return NextResponse.json(
        { error: "Forecast quantity is required and must be a number" },
        { status: 400 }
      );
    }

    // Calculate ingredient requirements
    const requirements = await ingredientRequirementsService.calculateRequirements(
      recipeId,
      forecastQuantity
    );

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error("Error in ingredient requirements API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}