// src/services/forecastService.ts
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

export const forecastService = {
  async generateForecast(
    salesData: AggregatedSalesData,
    daysToForecast: number = 7
  ): Promise<ForecastResult> {
    console.log("[DEBUG] Starting forecast generation for recipe:", salesData.recipeId);
    const windowSize = 7;
    const quantities = this.simplePreprocess(salesData.quantities);
    console.log("[DEBUG] Preprocessed quantities length:", quantities.length);

    // Use fallback for insufficient data
    if (quantities.length < windowSize * 2) {
      console.log("[DEBUG] Insufficient data, using fallback forecast");
      return this.fallbackForecast(salesData, daysToForecast);
    }

    try {
      // Clear TensorFlow backend before creating a new model
      console.log("[DEBUG] Clearing TensorFlow memory before model creation");
      tf.engine().startScope(); // Start a new scope to track tensors
      
      const { model, min, max, accuracy } = await this.trainModel(
        quantities,
        windowSize
      );
      console.log("[DEBUG] Model trained with accuracy:", accuracy);

      const predictions = await this.predictFuture(
        model,
        quantities,
        windowSize,
        daysToForecast,
        min,
        max
      );
      console.log("[DEBUG] Generated predictions:", predictions);

      const futureDates = this.generateDates(salesData.dates, daysToForecast);

      await this.saveForecastResult(
        salesData,
        futureDates,
        predictions,
        accuracy
      );

      // Dispose of the model and end the scope
      model.dispose();
      tf.engine().endScope();
      
      console.log("[DEBUG] Forecast generation completed successfully");
      return this.formatResult(salesData, futureDates, predictions, accuracy);
    } catch (error) {
      console.error("[DEBUG] Forecast failed, using fallback:", error);
      // Make sure to end the scope even if there's an error
      tf.engine().endScope();
      return this.fallbackForecast(salesData, daysToForecast);
    }
  },

  async trainModel(data: number[], windowSize: number): Promise<TrainedModel> {
    console.log("[DEBUG] Training model with data length:", data.length);
    const [min, max] = [Math.min(...data), Math.max(...data)];
    const normalized = data.map((v) => (v - min) / (max - min));

    // Use unique names for layers to avoid conflicts
    const uniqueId = Date.now().toString();
    console.log("[DEBUG] Creating model with unique ID:", uniqueId);
    
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 8,
          inputShape: [windowSize],
          activation: "relu",
          name: `dense_input_${uniqueId}`,
        }),
        tf.layers.dense({ 
          units: 1, 
          activation: "linear",
          name: `dense_output_${uniqueId}`,
        }),
      ],
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "meanSquaredError",
    });

    const [sequences, targets] = this.createTrainingData(
      normalized,
      windowSize
    );
    const xs = tf.tensor2d(sequences);
    const ys = tf.tensor2d(targets, [targets.length, 1]);

    console.log("[DEBUG] Starting model training");
    await model.fit(xs, ys, {
      epochs: 30,
      batchSize: 8,
      validationSplit: 0.2,
      callbacks: tf.callbacks.earlyStopping({ patience: 3 }),
    });
    console.log("[DEBUG] Model training completed");

    const accuracy = this.calculateQuickAccuracy(
      model,
      normalized,
      data,
      windowSize,
      min,
      max
    );

    // Clean up tensors
    tf.dispose([xs, ys]);
    return { model, min, max, windowSize, accuracy };
  },

  calculateQuickAccuracy(
    model: tf.LayersModel,
    normalizedData: number[],
    originalData: number[],
    windowSize: number,
    min: number,
    max: number
  ): number {
    // Use a small sample of the data for quick MAE calculation
    // Take the last few points (up to 10) to evaluate model performance
    const sampleSize = Math.min(10, originalData.length - windowSize);
    let totalError = 0;
    
    // Calculate MAE on a small sample
    for (let i = 0; i < sampleSize; i++) {
      const idx = originalData.length - sampleSize - windowSize + i;
      if (idx < 0) continue;
      
      // Get the window for this prediction
      const testWindow = normalizedData.slice(idx, idx + windowSize);
      const inputTensor = tf.tensor2d([testWindow]);
      
      // Make prediction
      const prediction = model.predict(inputTensor) as tf.Tensor;
      const predValue = prediction.dataSync()[0] * (max - min) + min;
      
      // Get actual value
      const actual = originalData[idx + windowSize];
      
      // Calculate absolute error
      totalError += Math.abs(predValue - actual);
      
      // Clean up tensor
      tf.dispose([inputTensor, prediction]);
    }
    
    // Calculate MAE
    const mae = totalError / sampleSize;
    
    // Convert MAE to a confidence score between 0 and 1
    // Lower MAE means higher confidence
    // Use a simple formula: confidence = 1 / (1 + mae)
    const confidence = 1 / (1 + mae);
    
    return Math.max(0, Math.min(1, confidence)); // Ensure between 0 and 1
  },

  async predictFuture(
    model: tf.LayersModel,
    data: number[],
    windowSize: number,
    days: number,
    min: number,
    max: number
  ): Promise<number[]> {
    let lastWindow = data
      .slice(-windowSize)
      .map((v) => (v - min) / (max - min));

    const predictions: number[] = [];

    for (let i = 0; i < days; i++) {
      const input = tf.tensor2d([lastWindow]);
      const pred = model.predict(input) as tf.Tensor;
      const value = pred.dataSync()[0] * (max - min) + min;

      predictions.push(Math.round(value));
      lastWindow = [...lastWindow.slice(1), (value - min) / (max - min)];

      tf.dispose([input, pred]);
    }

    return predictions;
  },

  simplePreprocess(data: number[]): number[] {
    // Simple zero handling and smoothing
    return data.map((v, i) => {
      if (v === 0)
        return (
          data
            .slice(Math.max(0, i - 3), i)
            .filter((x) => x > 0)
            .reduce((a, b) => a + b, 1) / 4 || 1
        );
      return v;
    });
  },

  generateDates(lastDates: string[], days: number): string[] {
   // const lastDate = new Date(lastDates[lastDates.length - 1]);
   const lastDate = new Date(); // Use today's date instead of last sales date
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(lastDate);
      date.setDate(date.getDate() + i + 1);
      return date.toISOString().split("T")[0];
    });
  },

  fallbackForecast(
    salesData: AggregatedSalesData,
    days: number
  ): ForecastResult {
    const avg =
      salesData.quantities.length > 0
        ? salesData.quantities.reduce((a, b) => a + b, 0) /
          salesData.quantities.length
        : 10; // Default fallback
    
    // Generate future dates starting from today
    const futureDates = this.generateDates(salesData.dates, days);
    
    return {
      recipeId: salesData.recipeId,
      recipeName: salesData.recipeName,
      dates: [...salesData.dates, ...futureDates],
      actualQuantities: [...salesData.quantities, ...Array(days).fill(null)],
      predictedQuantities: [
        ...Array(salesData.quantities.length).fill(null),
        ...Array(days).fill(Math.round(avg)),
      ],
      confidenceLevel: 0.5,
    };
  },

  async saveForecastResult(
    salesData: AggregatedSalesData,
    futureDates: string[],
    predictions: number[],
    accuracy: number
  ): Promise<void> {
    console.log("[DEBUG] Saving forecast result for recipe:", salesData.recipeId);
    console.log("[DEBUG] Future dates range:", futureDates[0], "to", futureDates[futureDates.length - 1]);
    
    const forecastQuantity = predictions.reduce((a, b) => a + b, 0);
    console.log("[DEBUG] Total forecast quantity:", forecastQuantity);
    
    // Prepare arrays for the database
    const actualQuantitiesArray = salesData.quantities.map(q => Math.round(q)); // Convert to integers
    const predictedQuantitiesArray = predictions.map(p => Math.round(p)); // Convert to integers
    const allDates = [...salesData.dates, ...futureDates];
    
    console.log("[DEBUG] Actual quantities length:", actualQuantitiesArray.length);
    console.log("[DEBUG] Predicted quantities length:", predictedQuantitiesArray.length);
    console.log("[DEBUG] All dates length:", allDates.length);
    
    // Prepare time series data for backward compatibility
    const timeSeriesData = {
      dates: allDates,
      actual: [
        ...salesData.quantities,
        ...Array(predictions.length).fill(null),
      ],
      predicted: [
        ...Array(salesData.quantities.length).fill(null),
        ...predictions,
      ],
    };
    
    try {
      await prisma.demandForecast.create({
        data: {
          recipeId: salesData.recipeId,
          recipeName: salesData.recipeName,
          startDate: new Date(futureDates[0]),
          endDate: new Date(futureDates[futureDates.length - 1]),
          forecastQuantity: forecastQuantity,
          confidenceLevel: accuracy,
          factors: JSON.stringify({ model: "optimized-dense" }),
          timeSeriesData: JSON.stringify(timeSeriesData),
          // Add the new fields from the updated schema
          actualQuantities: actualQuantitiesArray,
          predictedQuantities: predictedQuantitiesArray,
          dates: allDates,
        },
      });
      console.log("[DEBUG] Forecast successfully saved to database with arrays");
    } catch (error) {
      console.error("[DEBUG] Error saving forecast to database:", error);
      throw error;
    }
  },

  formatResult(
    salesData: AggregatedSalesData,
    futureDates: string[],
    predictions: number[],
    accuracy: number
  ): ForecastResult {
    console.log("[DEBUG] Formatting forecast result");
    
    // Create arrays for the response
    const allDates = [...salesData.dates, ...futureDates];
    const actualQuantities = [
      ...salesData.quantities,
      ...Array(predictions.length).fill(null),
    ];
    const predictedQuantities = [
      ...Array(salesData.quantities.length).fill(null),
      ...predictions,
    ];
    
    console.log("[DEBUG] Formatted result - dates length:", allDates.length);
    console.log("[DEBUG] Formatted result - actual quantities length:", actualQuantities.length);
    console.log("[DEBUG] Formatted result - predicted quantities length:", predictedQuantities.length);
    
    return {
      recipeId: salesData.recipeId,
      recipeName: salesData.recipeName,
      dates: allDates,
      actualQuantities: actualQuantities,
      predictedQuantities: predictedQuantities,
      confidenceLevel: accuracy,
    };
  },

  createTrainingData(
    data: number[],
    windowSize: number
  ): [number[][], number[]] {
    const sequences: number[][] = [];
    const targets: number[] = [];

    for (let i = 0; i <= data.length - windowSize - 1; i++) {
      sequences.push(data.slice(i, i + windowSize));
      targets.push(data[i + windowSize]);
    }

    return [sequences, targets];
  },
};
