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
    console.log("[DEBUG] Calculating forecast accuracy with enhanced metrics");

    if (actual.length !== predicted.length) {
      throw new Error("Actual and predicted arrays must be the same length");
    }

    // Skip the first few predictions which are often less accurate
    const startIndex = Math.min(3, Math.floor(actual.length * 0.1));

    // Calculate multiple error metrics
    let mape = 0; // Mean Absolute Percentage Error
    let rmse = 0; // Root Mean Square Error
    let validPoints = 0;

    for (let i = startIndex; i < actual.length; i++) {
      if (actual[i] === 0) continue;

      // MAPE calculation
      const absPercentError = Math.abs((actual[i] - predicted[i]) / actual[i]);
      // Cap very large errors which can skew MAPE
      mape += Math.min(absPercentError, 3);

      // RMSE calculation
      rmse += Math.pow(actual[i] - predicted[i], 2);

      validPoints++;
    }

    // Normalize errors
    mape = validPoints > 0 ? mape / validPoints : 1;
    rmse = Math.sqrt(rmse / (validPoints > 0 ? validPoints : 1));

    // Scale RMSE to 0-1 range based on data range
    const actualRange =
      Math.max(...actual) - Math.min(...actual.filter((v) => v > 0));
    const normalizedRmse = Math.min(1, rmse / actualRange);

    // Weighted average of both metrics (MAPE has 70% weight, RMSE has 30%)
    const mapeScore = Math.max(0, Math.min(1, 1 - mape));
    const rmseScore = Math.max(0, Math.min(1, 1 - normalizedRmse));

    const combinedAccuracy = mapeScore * 0.7 + rmseScore * 0.3;

    console.log("[DEBUG] Accuracy metrics:", {
      mape: mape.toFixed(4),
      mapeScore: mapeScore.toFixed(4),
      rmse: rmse.toFixed(2),
      rmseScore: rmseScore.toFixed(4),
      combinedAccuracy: combinedAccuracy.toFixed(4),
    });

    return combinedAccuracy;
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
        units: 32, // Reduced from 64
        inputShape: [windowSize, 1],
        returnSequences: false, // Single LSTM layer for smaller datasets
        recurrentDropout: 0.2, // Use recurrent dropout instead
      })
    );

    model.add(
      tf.layers.dense({
        units: 8,
        activation: "relu",
        kernelRegularizer: tf.regularizers.l2({ l2: 0.005 }), // Lighter regularization
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
      epochs: epochs, // Changed from epochs * 2 to just epochs
      batchSize: 8, // Smaller batch size for better generalization
      shuffle: true,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 20 === 0) {
            console.log(
              `[DEBUG] Epoch ${epoch}: loss = ${logs?.loss?.toFixed(
                4
              )}, val_loss = ${logs?.val_loss?.toFixed(4)}`
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
    daysToForecast: number = 7,
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
      // Preprocess the data to handle gaps and inconsistencies
      const preprocessedQuantities = forecastService.preprocessData(
        quantities,
        salesData.dates
      );

      // Determine optimal window size based on data patterns
      const optimalWindowSize =
        quantities.length >= 30
          ? forecastService.determineOptimalWindowSize(
              preprocessedQuantities,
              windowSize
            )
          : windowSize;

      // Train model with enhanced parameters
      const { model, min, max, accuracy } =
        await forecastService.createAndTrainModel(
          preprocessedQuantities,
          optimalWindowSize,
          100 // Changed from 150 to 100
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
      const normalizedData = preprocessedQuantities.map(
        (val) => (val - min) / (max - min)
      );
      const predictions: number[] = [];

      let lastWindow = normalizedData.slice(-optimalWindowSize);

      for (let i = 0; i < daysToForecast; i++) {
        // Reshape for prediction
        const input = tf.tensor3d(
          [lastWindow.map((val) => [val])],
          [1, optimalWindowSize, 1]
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

      // Save forecast with calculated confidence level and time series data
      await forecastService.saveForecast(
        salesData.recipeId,
        salesData.recipeName,
        futureDates[0],
        futureDates[futureDates.length - 1],
        predictions.reduce((sum, val) => sum + val, 0),
        accuracy,
        // Add time series data
        [...salesData.dates, ...futureDates],
        [...quantities, ...Array(daysToForecast).fill(null)],
        [...Array(quantities.length).fill(null), ...predictions]
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
    recipeName: string, // Add recipe name parameter
    startDate: string,
    endDate: string,
    forecastQuantity: number,
    confidenceLevel: number,
    // Add time series data parameters
    dates: string[],
    actualQuantities: (number | null)[],
    predictedQuantities: (number | null)[]
  ): Promise<void> => {
    console.log("[DEBUG] Saving forecast:", {
      recipeId,
      startDate,
      endDate,
      forecastQuantity,
      confidenceLevel: confidenceLevel.toFixed(4),
      confidence_percentage: `${(confidenceLevel * 100).toFixed(2)}%`,
    });

    // Create a time series data object
    const timeSeriesData = {
      dates,
      actualQuantities,
      predictedQuantities,
    };

    await prisma.demandForecast.create({
      data: {
        recipeId,
        recipeName, // Store the recipe name
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        forecastQuantity,
        confidenceLevel,
        factors: JSON.stringify({
          method: "tensorflow",
          model: "LSTM",
        }),
        // Store time series data as JSON string
        timeSeriesData: JSON.stringify(timeSeriesData),
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

  /**
   * Fill gaps and smooth data to improve forecast quality
   */
  preprocessData: (data: number[], dates: string[]): number[] => {
    console.log("[DEBUG] Preprocessing data:", {
      originalDataPoints: data.length,
      zeros: data.filter((v) => v === 0).length,
    });

    // Fill missing days (zero values)
    const filledData = [...data];
    for (let i = 0; i < filledData.length; i++) {
      if (filledData[i] === 0) {
        // Get average of neighboring non-zero values
        let sum = 0;
        let count = 0;
        for (
          let j = Math.max(0, i - 7);
          j <= Math.min(filledData.length - 1, i + 7);
          j++
        ) {
          if (j !== i && filledData[j] > 0) {
            sum += filledData[j];
            count++;
          }
        }
        filledData[i] = count > 0 ? Math.round(sum / count) : 1;
      }
    }

    // Check for weekly patterns (common in bakery sales)
    const daysOfWeek = dates.map((date) => new Date(date).getDay());
    const byWeekday = [0, 1, 2, 3, 4, 5, 6].map((day) => {
      const values = filledData.filter((_, i) => daysOfWeek[i] === day);
      return values.length > 0
        ? Math.round(values.reduce((s, v) => s + v, 0) / values.length)
        : 0;
    });

    console.log("[DEBUG] Weekly pattern detected:", { byWeekday });

    // Apply light smoothing with weighted moving average
    const smoothedData = [];
    for (let i = 0; i < filledData.length; i++) {
      const window = 3;
      let weightedSum = filledData[i] * 0.6; // Current value has 60% weight
      let totalWeight = 0.6;

      for (let j = 1; j <= window; j++) {
        if (i - j >= 0) {
          weightedSum += filledData[i - j] * (0.4 / window);
          totalWeight += 0.4 / window;
        }
        if (i + j < filledData.length) {
          weightedSum += filledData[i + j] * (0.4 / window);
          totalWeight += 0.4 / window;
        }
      }

      smoothedData.push(Math.round(weightedSum / totalWeight));
    }

    console.log("[DEBUG] Data preprocessing complete");
    return smoothedData;
  },

  // Add to generateForecast function:
  determineOptimalWindowSize: (
    quantities: number[],
    windowSize: number
  ): number => {
    // Default to user-provided window size
    let bestWindowSize = windowSize;

    // For bakery data, common optimal windows are 7 (weekly) or 14 (biweekly)
    const candidateWindows = [7, 10, 14];

    // If we have enough data, also consider monthly patterns
    if (quantities.length >= 60) {
      candidateWindows.push(30);
    }

    console.log("[DEBUG] Testing window sizes:", { candidateWindows });

    // Find which window size works best on a small validation set
    let bestAccuracy = 0;

    for (const ws of candidateWindows) {
      // Need enough data for training + validation
      if (quantities.length < ws * 3) continue;

      try {
        // Use a simple moving average model to test window sizes
        const testSize = Math.floor(quantities.length * 0.3);
        const trainData = quantities.slice(0, -testSize);
        const validData = quantities.slice(-testSize);

        // Generate simple predictions for validation set
        const predictions = [];

        for (let i = 0; i < validData.length; i++) {
          // Use moving average of the last 'ws' points as the prediction
          const lookback = Math.min(ws, trainData.length + i);
          const windowData = [...trainData, ...validData.slice(0, i)].slice(
            -lookback
          );
          const avg =
            windowData.reduce((sum, val) => sum + val, 0) / windowData.length;
          predictions.push(Math.round(avg));
        }

        const accuracy = forecastService.calculateAccuracy(
          validData,
          predictions
        );
        console.log(
          `[DEBUG] Window size ${ws} test accuracy: ${accuracy.toFixed(4)}`
        );

        if (accuracy > bestAccuracy) {
          bestAccuracy = accuracy;
          bestWindowSize = ws;
        }
      } catch (e) {
        console.error(`[DEBUG] Error testing window size ${ws}:`, e);
      }
    }

    console.log(
      `[DEBUG] Selected optimal window size: ${bestWindowSize} with accuracy ${bestAccuracy.toFixed(
        4
      )}`
    );
    return bestWindowSize;
  },
};
