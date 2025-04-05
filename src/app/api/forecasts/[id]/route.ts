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

    // Use the direct arrays from the database if available, otherwise fall back to timeSeriesData
    let dates = forecast.dates || [];
    let actualQuantities = forecast.actualQuantities || [];
    let predictedQuantities = forecast.predictedQuantities || [];
    
    // If the arrays are empty, try to parse from timeSeriesData for backward compatibility
    if (dates.length === 0 && forecast.timeSeriesData) {
      const timeSeriesData = JSON.parse(
        forecast.timeSeriesData ||
          '{"dates":[],"actual":[],"predicted":[]}'
      );
      
      dates = timeSeriesData.dates || [];
      actualQuantities = timeSeriesData.actual || [];
      predictedQuantities = timeSeriesData.predicted || [];
    }

    // Calculate the prediction start index - this is where actual data ends
    // and predictions begin
    const predictionStartIndex = actualQuantities.length;
    
    // Create properly structured arrays for the chart
    // For actual data: fill with actual values followed by nulls for prediction period
    const structuredActualQuantities = [
      ...actualQuantities,
      ...Array(predictedQuantities.length).fill(null)
    ];
    
    // For predicted data: fill with nulls for historical period, then add predictions
    const structuredPredictedQuantities = [
      ...Array(actualQuantities.length).fill(null),
      ...predictedQuantities
    ];

    // Format the response
    const formattedForecast = {
      id: forecast.id,
      recipeId: forecast.recipe?.id || 0,
      recipeName: forecast.recipeName || forecast.recipe?.name || "Unknown Recipe",
      startDate: forecast.startDate.toISOString(),
      endDate: forecast.endDate.toISOString(),
      forecastQuantity: forecast.forecastQuantity,
      confidenceLevel: forecast.confidenceLevel,
      factors: forecast.factors,
      notes: forecast.notes,
      createdAt: forecast.createdAt.toISOString(),
      // Use the structured arrays for the chart
      dates: dates,
      actualQuantities: structuredActualQuantities,
      predictedQuantities: structuredPredictedQuantities,
      // Add the prediction start index to help the chart
      predictionStartIndex: predictionStartIndex
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
