import { NextRequest, NextResponse } from "next/server";
import { salesService } from "@/lib/services/salesService";
import { forecastService } from "@/lib/services/forecastService";

export async function GET(request: NextRequest) {
  console.log("[DEBUG] GET /api/forecasts - Request received");
  try {
    const searchParams = request.nextUrl.searchParams;
    const recipeId = searchParams.get("recipeId");

    console.log(
      `[DEBUG] Fetching forecasts with recipeId filter: ${recipeId || "none"}`
    );

    const forecasts = await forecastService.getSavedForecasts(
      recipeId ? parseInt(recipeId) : undefined
    );

    console.log(`[DEBUG] Found ${forecasts.length} forecasts`);

    return NextResponse.json({ forecasts });
  } catch (error) {
    console.error("[DEBUG] Error fetching forecasts:", error);
    return NextResponse.json(
      { error: "Failed to fetch forecasts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("[DEBUG] POST /api/forecasts - Request received");
  try {
    const body = await request.json();
    // Extract recipeId but use fixed values for other parameters
    const { recipeId } = body;
    // Fixed parameters as requested
    const days = 365;
    const forecastDays = 7;
    const windowSize = 7;

    console.log(
      `[DEBUG] Forecast request params: recipeId=${recipeId}, days=${days}, forecastDays=${forecastDays}, windowSize=${windowSize}`
    );

    if (!recipeId) {
      console.log("[DEBUG] Error: Recipe ID is missing");
      return NextResponse.json(
        { error: "Recipe ID is required" },
        { status: 400 }
      );
    }

    // Get sales data
    console.log(`[DEBUG] Fetching sales history for recipe ${recipeId}`);
    const salesData = await salesService.getRecipeSalesHistory(recipeId, days);
    console.log(`[DEBUG] Found ${salesData.length} sales data points`);

    if (salesData.length < windowSize * 2) {
      console.log(
        `[DEBUG] Error: Not enough sales data (${
          salesData.length
        }) for forecasting. Need at least ${windowSize * 2}`
      );
      return NextResponse.json(
        { error: "Not enough sales data for forecasting" },
        { status: 400 }
      );
    }

    // Aggregate by date
    console.log("[DEBUG] Aggregating sales data by date");
    const dateMap = new Map<string, number>();
    salesData.forEach((item) => {
      const existing = dateMap.get(item.date) || 0;
      dateMap.set(item.date, existing + item.quantity);
    });

    // Sort dates
    const sortedDates = Array.from(dateMap.keys()).sort();
    console.log(
      `[DEBUG] Aggregated data into ${sortedDates.length} unique dates`
    );

    const aggregatedData = {
      recipeId,
      recipeName: salesData[0]?.recipeName || `Recipe ${recipeId}`,
      dates: sortedDates,
      quantities: sortedDates.map((date) => dateMap.get(date) || 0),
    };

    // Generate forecast
    console.log("[DEBUG] Generating forecast with TensorFlow model");
    const forecast = await forecastService.generateForecast(
      aggregatedData,
      forecastDays
    );

    console.log("[DEBUG] Forecast generated successfully");

    return NextResponse.json({ forecast });
  } catch (error) {
    console.error("[DEBUG] Error generating forecast:", error);
    return NextResponse.json(
      { error: "Failed to generate forecast" },
      { status: 500 }
    );
  }
}
