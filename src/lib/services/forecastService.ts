import * as tf from "@tensorflow/tfjs";
import { AggregatedSalesData } from "./salesService";
import { prisma } from "@/lib/prisma";

export interface ForecastResult {
  recipeId: number;
  recipeName: string;
  dates: string[];
  actualQuantities: (number | null)[];
  predictedQuantities: (number | null)[];
}

interface TrainedModel {
  model: tf.LayersModel;
  min: number;
  max: number;
  windowSize: number;
}

export const forecastService = {
  /**
   * Create and train a TensorFlow model for time series forecasting
   */
  createAndTrainModel: async (
    data: number[],
    windowSize: number = 7,
    epochs: number = 100
  ): Promise<TrainedModel> => {
    // Normalize data
    const min = Math.min(...data);
    const max = Math.max(...data);
    const normalizedData = data.map((val) => (val - min) / (max - min));

    // Create sequences for training
    const sequences: number[][] = [];
    const targets: number[] = [];

    for (let i = 0; i <= normalizedData.length - windowSize - 1; i++) {
      const sequence = normalizedData.slice(i, i + windowSize);
      sequences.push(sequence);
      targets.push(normalizedData[i + windowSize]);
    }

    // Convert to tensors
    const xs = tf.tensor2d(sequences);
    const ys = tf.tensor1d(targets);

    // Create model
    const model = tf.sequential();
    model.add(
      tf.layers.lstm({
        units: 32,
        inputShape: [windowSize, 1],
        returnSequences: false,
      })
    );
    model.add(tf.layers.dense({ units: 1 }));

    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: "meanSquaredError",
    });

    // Reshape input for LSTM [samples, timesteps, features]
    const reshapedXs = xs.reshape([sequences.length, windowSize, 1]);

    // Train model
    await model.fit(reshapedXs, ys, {
      epochs,
      batchSize: 32,
      shuffle: true,
      verbose: 0,
    });

    return {
      model,
      min,
      max,
      windowSize,
    };
  },

  /**
   * Generate forecast for a specific recipe
   */
  generateForecast: async (
    salesData: AggregatedSalesData,
    daysToForecast: number = 30,
    windowSize: number = 7
  ): Promise<ForecastResult> => {
    const quantities = salesData.quantities;

    if (quantities.length < windowSize * 2) {
      throw new Error(
        `Not enough data for recipe ${salesData.recipeName}. Need at least ${
          windowSize * 2
        } data points.`
      );
    }

    // Train model
    const { model, min, max } = await forecastService.createAndTrainModel(
      quantities,
      windowSize
    );

    // Generate dates for forecast
    const lastDate = new Date(salesData.dates[salesData.dates.length - 1]);
    const futureDates: string[] = [];

    for (let i = 1; i <= daysToForecast; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + i);
      futureDates.push(nextDate.toISOString().split("T")[0]);
    }

    // Generate predictions
    const normalizedData = quantities.map((val) => (val - min) / (max - min));
    const predictions: number[] = [];

    let lastWindow = normalizedData.slice(-windowSize);

    for (let i = 0; i < daysToForecast; i++) {
      // Reshape for prediction - Fix the tensor shape
      const input = tf.tensor3d(
        [lastWindow.map((val) => [val])],
        [1, windowSize, 1]
      );

      // Get prediction
      const predictionTensor = model.predict(input) as tf.Tensor;
      const predictionValue = predictionTensor.dataSync()[0];

      // Denormalize
      const denormalizedPrediction = predictionValue * (max - min) + min;
      predictions.push(Math.round(Math.max(0, denormalizedPrediction)));

      // Update window for next prediction
      lastWindow = [...lastWindow.slice(1), predictionValue];

      // Clean up tensors
      predictionTensor.dispose();
      input.dispose();
    }

    // Save forecast to database
    await forecastService.saveForecast(
      salesData.recipeId,
      futureDates[0],
      futureDates[futureDates.length - 1],
      predictions.reduce((sum, val) => sum + val, 0)
    );

    return {
      recipeId: salesData.recipeId,
      recipeName: salesData.recipeName,
      dates: [...salesData.dates, ...futureDates],
      actualQuantities: [...quantities, ...Array(daysToForecast).fill(null)],
      predictedQuantities: [
        ...Array(quantities.length).fill(null),
        ...predictions,
      ],
    };
  },

  /**
   * Save forecast to database
   */
  saveForecast: async (
    recipeId: number,
    startDate: string,
    endDate: string,
    forecastQuantity: number
  ): Promise<void> => {
    await prisma.demandForecast.create({
      data: {
        modelType: "LSTM", // Required field based on the error
        recipeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        forecastQuantity,
        confidenceLevel: 0.8, // Default confidence level
        factors: JSON.stringify({
          method: "tensorflow",
          model: "LSTM",
        }),
      },
    });
  },

  /**
   * Get saved forecasts for a recipe
   */
  getSavedForecasts: async (recipeId?: number) => {
    return prisma.demandForecast.findMany({
      where: recipeId ? { recipeId } : {},
      orderBy: {
        createdAt: "desc",
      },
      include: {
        recipe: {
          select: {
            name: true,
          },
        },
      },
    });
  },
};
