import * as tf from "@tensorflow/tfjs";
import { AggregatedSalesData } from "./salesService";
import { prisma } from "@/lib/prisma";

export interface ForecastResult {
  recipeId: number;
  recipeName: string;
  dates: string[];
  actualQuantities: (number | null)[];
  predictedQuantities: (number | null)[];
  confidenceLevel: number;
}

interface TrainedModel {
  model: tf.LayersModel;
  min: number;
  max: number;
  windowSize: number;
  accuracy: number;
}

// Keep track of model count to create unique names
let modelCounter = 0;

export const forecastService = {
  /**
   * Calculate forecast accuracy using validation data
   * Returns a value between 0 and 1, where:
   * - 1.0 represents perfect prediction (100% accurate)
   * - 0.0 represents poor prediction (0% accurate)
   * Higher values indicate better forecast accuracy
   */
  calculateAccuracy: (actual: number[], predicted: number[]): number => {
    console.log("[DEBUG] Calculating forecast accuracy:", {
      actualDataPoints: actual.length,
      predictedDataPoints: predicted.length,
    });

    if (actual.length !== predicted.length) {
      throw new Error("Actual and predicted arrays must be the same length");
    }

    // Calculate MAPE (Mean Absolute Percentage Error)
    // MAPE measures the average percentage difference between predicted and actual values
    const mape =
      actual.reduce((sum, value, index) => {
        if (value === 0) return sum; // Skip zero values to avoid division by zero
        const percentageError = Math.abs((value - predicted[index]) / value);
        return sum + percentageError;
      }, 0) / actual.length;

    // Convert MAPE to accuracy (0-1 scale)
    // Since MAPE is an error rate (lower is better), we subtract from 1 to get accuracy (higher is better)
    const accuracy = Math.max(0, Math.min(1, 1 - mape));

    console.log("[DEBUG] Forecast accuracy calculated:", {
      mape: mape.toFixed(4),
      accuracy: accuracy.toFixed(4),
    });

    return accuracy;
  },

  /**
   * Create and train a TensorFlow model for time series forecasting
   */
  createAndTrainModel: async (
    data: number[],
    windowSize: number = 7,
    epochs: number = 100
  ): Promise<TrainedModel> => {
    console.log("[DEBUG] Starting model training:", {
      windowSize,
      epochs,
      dataLength: data.length,
    });

    tf.disposeVariables();

    // Enhanced data normalization with outlier handling
    const sortedData = [...data].sort((a, b) => a - b);
    const q1 = sortedData[Math.floor(sortedData.length * 0.25)];
    const q3 = sortedData[Math.floor(sortedData.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const cleanedData = data.map((val) =>
      Math.min(Math.max(val, lowerBound), upperBound)
    );

    const min = Math.min(...cleanedData);
    const max = Math.max(...cleanedData);
    const normalizedData = cleanedData.map((val) => (val - min) / (max - min));

    // Enhanced model architecture
    const model = tf.sequential({ name: `forecast_model_${modelCounter++}` });

    // Add more sophisticated layers
    model.add(
      tf.layers.lstm({
        units: 64, // Increased units
        inputShape: [windowSize, 1],
        returnSequences: true,
        name: `lstm_layer1`,
        dropout: 0.2, // Add dropout for regularization
      })
    );

    model.add(
      tf.layers.lstm({
        units: 32,
        returnSequences: false,
        name: `lstm_layer2`,
        dropout: 0.1,
      })
    );

    // Add dense layers with regularization
    model.add(
      tf.layers.dense({
        units: 16,
        activation: "relu",
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
      })
    );

    model.add(
      tf.layers.dense({
        units: 1,
        activation: "linear",
      })
    );

    // Enhanced training configuration
    model.compile({
      optimizer: tf.train.adam(0.001), // Lower learning rate
      loss: "meanSquaredError", // Use valid loss function
      metrics: ["mse"],
    });

    // Create sequences with overlap
    const sequences: number[][] = [];
    const targets: number[] = [];
    const stride = Math.max(1, Math.floor(windowSize / 4)); // Overlapping windows

    for (let i = 0; i <= normalizedData.length - windowSize - 1; i += stride) {
      const sequence = normalizedData.slice(i, i + windowSize);
      sequences.push(sequence);
      targets.push(normalizedData[i + windowSize]);
    }

    const xs = tf.tensor2d(sequences);
    const ys = tf.tensor1d(targets);
    const reshapedXs = xs.reshape([sequences.length, windowSize, 1]);

    // Enhanced training process
    await model.fit(reshapedXs, ys, {
      epochs,
      batchSize: 16, // Smaller batch size
      shuffle: true,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(
              `[DEBUG] Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}`
            );
          }
        },
      },
    });

    // Clean up training tensors
    xs.dispose();
    ys.dispose();
    reshapedXs.dispose();

    // Split data for validation (80% training, 20% validation)
    const validationSplit = 0.2;
    const validationSize = Math.floor(data.length * validationSplit);
    const trainingData = data.slice(0, -validationSize);
    const validationData = data.slice(-validationSize);

    console.log("[DEBUG] Split data for validation:", {
      totalDataPoints: data.length,
      trainingDataPoints: trainingData.length,
      validationDataPoints: validationData.length,
    });

    // Generate predictions for validation data
    // We use the last window of training data to start predictions
    console.log("[DEBUG] Generating validation predictions");
    const validationPredictions: number[] = [];
    let lastWindow = normalizedData.slice(
      -windowSize - validationSize,
      -validationSize
    );

    for (let i = 0; i < validationSize; i++) {
      const input = tf.tensor3d(
        [lastWindow.map((val) => [val])],
        [1, windowSize, 1]
      );
      const predictionTensor = model.predict(input) as tf.Tensor;
      const predictionValue = predictionTensor.dataSync()[0];
      const denormalizedPrediction = predictionValue * (max - min) + min;
      validationPredictions.push(
        Math.round(Math.max(0, denormalizedPrediction))
      );

      // Update window for next prediction by sliding it forward
      lastWindow = [...lastWindow.slice(1), predictionValue];
      predictionTensor.dispose();
      input.dispose();
    }

    // Calculate model accuracy using validation data
    console.log("[DEBUG] Calculating model accuracy using validation data");
    const accuracy = forecastService.calculateAccuracy(
      validationData,
      validationPredictions
    );

    console.log("[DEBUG] Model training completed:", {
      windowSize,
      epochs,
      finalAccuracy: accuracy.toFixed(4),
    });

    return {
      model,
      min,
      max,
      windowSize,
      accuracy,
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
    console.log("[DEBUG] Starting forecast generation:", {
      recipeId: salesData.recipeId,
      daysToForecast,
      windowSize,
      dataPoints: salesData.quantities.length,
    });
    const quantities = salesData.quantities;

    if (quantities.length < windowSize * 2) {
      throw new Error(
        `Not enough data for recipe ${salesData.recipeName}. Need at least ${
          windowSize * 2
        } data points.`
      );
    }

    try {
      // Train model with accuracy
      const { model, min, max, accuracy } =
        await forecastService.createAndTrainModel(quantities, windowSize);

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
        // Reshape for prediction
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

      // Clean up model when done
      model.dispose();

      // Save forecast with calculated confidence level
      await forecastService.saveForecast(
        salesData.recipeId,
        futureDates[0],
        futureDates[futureDates.length - 1],
        predictions.reduce((sum, val) => sum + val, 0),
        accuracy
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
        confidenceLevel: accuracy,
      };
    } catch (error) {
      console.error("[DEBUG] Error in generateForecast:", error);
      throw error;
    }
  },

  /**
   * Save forecast to database
   */
  saveForecast: async (
    recipeId: number,
    startDate: string,
    endDate: string,
    forecastQuantity: number,
    confidenceLevel: number
  ): Promise<void> => {
    console.log("[DEBUG] Saving forecast:", {
      recipeId,
      startDate,
      endDate,
      forecastQuantity,
      confidenceLevel: confidenceLevel.toFixed(4), // Show confidence level with 4 decimal places
      confidence_percentage: `${(confidenceLevel * 100).toFixed(2)}%`, // Show as percentage for clarity
    });
    await prisma.demandForecast.create({
      data: {
        recipeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        forecastQuantity,
        confidenceLevel,
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
    console.log("[DEBUG] Fetching forecasts:", { recipeId: recipeId || "all" });
    return prisma.demandForecast.findMany({
      where: recipeId ? { recipeId } : {},
      orderBy: {
        createdAt: "desc",
      },
    });
  },
};
