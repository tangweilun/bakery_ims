import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const {
      recipeId,
      recipeName,
      startDate,
      endDate,
      forecastQuantity,
      confidenceLevel,
      factors,
      timeSeriesData,
    } = await request.json();

    // Validate required fields
    if (!recipeId || !startDate || !endDate || !forecastQuantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the forecast
    const forecast = await prisma.demandForecast.create({
      data: {
        recipeId,
        recipeName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        forecastQuantity,
        confidenceLevel,
        factors,
        timeSeriesData,
      },
    });

    return NextResponse.json({ success: true, forecast });
  } catch (error) {
    console.error("Error saving forecast:", error);
    return NextResponse.json(
      { error: "Failed to save forecast" },
      { status: 500 }
    );
  }
}