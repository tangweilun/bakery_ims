// app/lib/tensorflowModel.ts
import * as tf from "@tensorflow/tfjs";

// Function to prepare time series data for TensorFlow model
export function prepareTimeSeriesData(data: number[], windowSize: number = 7) {
  const X = [];
  const y = [];

  for (let i = 0; i <= data.length - windowSize - 1; i++) {
    X.push(data.slice(i, i + windowSize));
    y.push(data[i + windowSize]);
  }

  return { X, y };
}

// Build a simple LSTM model for time series prediction
export async function buildLSTMModel(
  data: number[],
  epochs: number = 50,
  windowSize: number = 7
) {
  // Prepare data
  const { X, y } = prepareTimeSeriesData(data, windowSize);

  if (X.length === 0 || y.length === 0) {
    throw new Error("Not enough data to train model");
  }

  // Scale data between 0 and 1 for better model performance
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const scaledX = X.map((sample) => sample.map((val) => (val - min) / range));
  const scaledY = y.map((val) => (val - min) / range);

  // Convert to tensors
  const inputTensor = tf.tensor3d(
    scaledX.map((arr) => arr.map((val) => [val])),
    [scaledX.length, windowSize, 1]
  );
  const outputTensor = tf.tensor2d(scaledY, [scaledY.length, 1]);

  // Create model
  const model = tf.sequential();

  model.add(
    tf.layers.lstm({
      units: 50,
      returnSequences: false,
      inputShape: [windowSize, 1],
    })
  );

  model.add(tf.layers.dense({ units: 1 }));

  model.compile({
    optimizer: "adam",
    loss: "meanSquaredError",
  });

  // Train model
  await model.fit(inputTensor, outputTensor, {
    epochs,
    batchSize: 32,
    shuffle: true,
    verbose: 0,
  });

  // Helper function to predict next values
  const predict = (inputData: number[], days: number = 7) => {
    const predictions = [];
    let lastWindow = [...inputData.slice(-windowSize)];

    for (let i = 0; i < days; i++) {
      // Prepare input
      const scaledInput = lastWindow.map((val) => (val - min) / range);
      const inputTensor = tf.tensor3d(
        [scaledInput.map((val) => [val])],
        [1, windowSize, 1]
      );

      // Make prediction
      const prediction = model.predict(inputTensor) as tf.Tensor;
      const scaledPrediction = prediction.dataSync()[0];
      const actualPrediction = scaledPrediction * range + min;

      // Store prediction and update window
      predictions.push(Math.max(0, Math.round(actualPrediction))); // Ensure non-negative integer
      lastWindow.shift();
      lastWindow.push(actualPrediction);
    }

    return predictions;
  };

  return { model, predict };
}

// Build a simple linear regression model
export function buildLinearRegressionModel(data: number[]) {
  // Create x values (just indices)
  const x = Array.from({ length: data.length }, (_, i) => i);

  // Calculate mean of x and y
  const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
  const meanY = data.reduce((sum, val) => sum + val, 0) / data.length;

  // Calculate slope and intercept using least squares
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < x.length; i++) {
    numerator += (x[i] - meanX) * (data[i] - meanY);
    denominator += (x[i] - meanX) * (x[i] - meanX);
  }

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  // Prediction function
  const predict = (days: number = 7) => {
    const predictions = [];
    const startIndex = x.length;

    for (let i = 0; i < days; i++) {
      const pred = slope * (startIndex + i) + intercept;
      predictions.push(Math.max(0, Math.round(pred))); // Ensure non-negative integer
    }

    return predictions;
  };

  return { slope, intercept, predict };
}
