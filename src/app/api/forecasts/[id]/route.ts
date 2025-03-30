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
    });

    if (!forecast) {
      return NextResponse.json(
        { error: "Forecast not found" },
        { status: 404 }
      );
    }

    // Transform the data to include chart information
    const transformedForecast = {
      ...forecast,
      recipeName: `Recipe ${forecast.recipeId}`,
      // You'll need to implement logic to get or generate these arrays
      dates: [], // Add logic to generate dates array between startDate and endDate
      actualQuantities: [], // Add logic to get historical data
      predictedQuantities: [], // Add logic to get prediction data
    };

    return NextResponse.json({ forecast: transformedForecast });
  } catch (error) {
    console.error("[DEBUG] Error fetching forecast:", error);
    return NextResponse.json(
      { error: "Failed to fetch forecast" },
      { status: 500 }
    );
  }
}
