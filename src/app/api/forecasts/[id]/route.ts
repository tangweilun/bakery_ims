import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const forecastId = parseInt(id);

    if (isNaN(forecastId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const forecast = await prisma.demandForecast.findUnique({
      where: { id: forecastId },
      include: {
        recipe: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    if (!forecast) {
      return NextResponse.json(
        { error: "Forecast not found" },
        { status: 404 }
      );
    }

    // Parse the time series data
    const timeSeriesData = JSON.parse(
      forecast.timeSeriesData ||
        '{"dates":[],"actualQuantities":[],"predictedQuantities":[]}'
    );

    // Format the response
    const formattedForecast = {
      id: forecast.id,
      recipeId: forecast.recipeId || 0,
      recipeName: forecast.recipeName || forecast.recipe?.name || "Unknown Recipe",
      startDate: forecast.startDate.toISOString(),
      endDate: forecast.endDate.toISOString(),
      forecastQuantity: forecast.forecastQuantity,
      confidenceLevel: forecast.confidenceLevel,
      factors: forecast.factors,
      notes: forecast.notes,
      createdAt: forecast.createdAt.toISOString(),
      // Include time series data
      dates: timeSeriesData.dates || [],
      actualQuantities: timeSeriesData.actualQuantities || [],
      predictedQuantities: timeSeriesData.predictedQuantities || [],
    };

    return NextResponse.json({ forecast: formattedForecast });
  } catch (error) {
    console.error("Error fetching forecast:", error);
    return NextResponse.json(
      { error: "Failed to fetch forecast details" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    const forecastId = parseInt(id);

    if (isNaN(forecastId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Check if the forecast exists
    const forecast = await prisma.demandForecast.findUnique({
      where: { id: forecastId },
    });

    if (!forecast) {
      return NextResponse.json(
        { error: "Forecast not found" },
        { status: 404 }
      );
    }

    // Delete the forecast
    await prisma.demandForecast.delete({
      where: { id: forecastId },
    });

    return NextResponse.json({ success: true, message: "Forecast deleted successfully" });
  } catch (error) {
    console.error("Error deleting forecast:", error);
    return NextResponse.json(
      { error: "Failed to delete forecast" },
      { status: 500 }
    );
  }
}
