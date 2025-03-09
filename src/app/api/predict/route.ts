import { NextResponse } from "next/server";
import { Product, SalesRecord, PredictionResult } from "../../model/type";
import {
  buildLSTMModel,
  buildLinearRegressionModel,
} from "../../../lib/tensorflowModel";

function calculateMovingAverage(data: number[], window: number): number {
  if (data.length < window) {
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }

  const recentData = data.slice(data.length - window);
  return recentData.reduce((sum, val) => sum + val, 0) / window;
}

function calculateWeightedAverage(data: number[], weights: number[]): number {
  if (data.length !== weights.length) {
    throw new Error("Data and weights arrays must have the same length");
  }

  let sum = 0;
  let weightSum = 0;

  for (let i = 0; i < data.length; i++) {
    sum += data[i] * weights[i];
    weightSum += weights[i];
  }

  return sum / weightSum;
}

function detectSeasonality(data: number[], period: number): boolean {
  // Simple seasonality detection by comparing similar days across periods
  if (data.length < period * 2) {
    return false;
  }

  const correlations = [];
  for (let i = 0; i < data.length - period; i++) {
    if (i + period < data.length) {
      const correlation = (data[i] - data[i + period]) / Math.max(data[i], 1);
      correlations.push(Math.abs(correlation));
    }
  }

  // If average correlation is small, there might be seasonality
  return (
    correlations.reduce((sum, val) => sum + val, 0) / correlations.length < 0.3
  );
}

export async function POST(request: Request) {
  try {
    const {
      salesData,
      products,
      days = 7,
      predictionMethod = "weighted",
    } = await request.json();

    // Validate input
    if (!Array.isArray(salesData) || !Array.isArray(products)) {
      return NextResponse.json(
        { error: "Invalid input: salesData and products must be arrays" },
        { status: 400 }
      );
    }

    // Group sales by product and date
    const productSales: { [productId: string]: { [date: string]: number } } =
      {};

    salesData.forEach((record: SalesRecord) => {
      if (!productSales[record.productId]) {
        productSales[record.productId] = {};
      }
      productSales[record.productId][record.date] = record.quantity;
    });

    // Calculate predictions for each product
    const predictions: PredictionResult[] = [];

    for (const product of products) {
      const sales = productSales[product.id];

      if (!sales) {
        predictions.push({
          productId: product.id,
          productName: product.name,
          predictedQuantity: 0,
          ingredients: {},
        });
        continue;
      }

      // Convert to array ordered by date
      const dates = Object.keys(sales).sort();
      const quantities = dates.map((date) => sales[date]);

      let predictedQuantity = 0;

      switch (predictionMethod) {
        case "moving":
          // Simple moving average (last 7 days)
          predictedQuantity = calculateMovingAverage(quantities, 7);
          break;

        case "weighted":
          // Weighted average (recent days have more weight)
          const weights = Array.from(
            { length: quantities.length },
            (_, i) => i + 1
          );
          predictedQuantity = calculateWeightedAverage(quantities, weights);
          break;

        case "seasonal":
          // Check for weekly seasonality
          const hasWeeklyPattern = detectSeasonality(quantities, 7);

          if (hasWeeklyPattern && quantities.length >= 7) {
            // Use same day from previous weeks
            const sameWeekdayQuantities = [];
            for (let i = 0; i < quantities.length; i += 7) {
              if (i < quantities.length) {
                sameWeekdayQuantities.push(quantities[i]);
              }
            }
            predictedQuantity = calculateWeightedAverage(
              sameWeekdayQuantities,
              Array.from(
                { length: sameWeekdayQuantities.length },
                (_, i) => i + 1
              )
            );
          } else {
            // Fall back to weighted average
            const weights = Array.from(
              { length: quantities.length },
              (_, i) => i + 1
            );
            predictedQuantity = calculateWeightedAverage(quantities, weights);
          }
          break;

        case "linear":
          // Linear regression model
          try {
            const model = buildLinearRegressionModel(quantities);
            const predictions = model.predict(1); // Just predict next day
            predictedQuantity = predictions[0];
          } catch (err) {
            console.error("Linear regression error:", err);
            // Fall back to weighted average
            const weights = Array.from(
              { length: quantities.length },
              (_, i) => i + 1
            );
            predictedQuantity = calculateWeightedAverage(quantities, weights);
          }
          break;

        case "lstm":
          // LSTM neural network model
          try {
            if (quantities.length >= 14) {
              // Need enough data for LSTM
              const { predict } = await buildLSTMModel(quantities, 30);
              const predictions = predict(quantities, 1); // Just predict next day
              predictedQuantity = predictions[0];
            } else {
              // Fall back to weighted average if not enough data
              const weights = Array.from(
                { length: quantities.length },
                (_, i) => i + 1
              );
              predictedQuantity = calculateWeightedAverage(quantities, weights);
            }
          } catch (err) {
            console.error("LSTM error:", err);
            // Fall back to weighted average
            const weights = Array.from(
              { length: quantities.length },
              (_, i) => i + 1
            );
            predictedQuantity = calculateWeightedAverage(quantities, weights);
          }
          break;

        default:
          // Simple average
          predictedQuantity =
            quantities.reduce((sum, val) => sum + val, 0) / quantities.length;
      }

      // Round to nearest whole number
      predictedQuantity = Math.round(predictedQuantity);

      // Calculate required ingredients
      const requiredIngredients: { [ingredient: string]: number } = {};

      Object.entries(product.ingredients).forEach(
        ([ingredient, amountPerUnit]) => {
          requiredIngredients[ingredient] =
            (amountPerUnit as number) * predictedQuantity;
        }
      );

      predictions.push({
        productId: product.id,
        productName: product.name,
        predictedQuantity,
        ingredients: requiredIngredients,
      });
    }

    // Calculate total ingredients needed across all products
    const totalIngredients: { [ingredient: string]: number } = {};

    predictions.forEach((prediction) => {
      Object.entries(prediction.ingredients).forEach(([ingredient, amount]) => {
        if (!totalIngredients[ingredient]) {
          totalIngredients[ingredient] = 0;
        }
        totalIngredients[ingredient] += amount;
      });
    });

    return NextResponse.json({
      predictions,
      totalIngredients,
      forecastDays: days,
    });
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json(
      { error: "Failed to process prediction request" },
      { status: 500 }
    );
  }
}
