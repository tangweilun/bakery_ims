"use client";

import { useState } from "react";
import { Product, SalesRecord, PredictionResult } from "../app/model/type";
import ProductForecast from "./ProductForecast";
import ForecastChart from "./ForecastChart";
import IngredientForecastChart from "./IngredientForecastChart";
export default function PredictionForm() {
  const [salesData, setSalesData] = useState<SalesRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [days, setDays] = useState(7);
  const [predictionMethod, setPredictionMethod] = useState("weighted");
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [totalIngredients, setTotalIngredients] = useState<{
    [ingredient: string]: number;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStock, setCurrentStock] = useState<{
    [ingredient: string]: number;
  }>({});

  // Sample data for demonstration
  const loadSampleData = () => {
    const sampleProducts: Product[] = [
      {
        id: "bread",
        name: "Sourdough Bread",
        ingredients: {
          flour: 0.5, // kg per loaf
          water: 0.3, // liters per loaf
          salt: 0.01, // kg per loaf
          yeast: 0.005, // kg per loaf
        },
      },
      {
        id: "croissant",
        name: "Croissant",
        ingredients: {
          flour: 0.1, // kg per croissant
          butter: 0.05, // kg per croissant
          sugar: 0.01, // kg per croissant
          yeast: 0.002, // kg per croissant
        },
      },
    ];

    // Generate 30 days of sample sales data
    const sampleSales: SalesRecord[] = [];
    const now = new Date();

    for (let i = 30; i >= 1; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      // More bread on weekends
      sampleSales.push({
        date: dateStr,
        productId: "bread",
        quantity: isWeekend
          ? 45 + Math.floor(Math.random() * 10)
          : 30 + Math.floor(Math.random() * 10),
      });

      // More croissants on weekends
      sampleSales.push({
        date: dateStr,
        productId: "croissant",
        quantity: isWeekend
          ? 80 + Math.floor(Math.random() * 20)
          : 50 + Math.floor(Math.random() * 15),
      });
    }

    setProducts(sampleProducts);
    setSalesData(sampleSales);
  };

  const handlePredict = async () => {
    if (salesData.length === 0 || products.length === 0) {
      setError("Please provide sales data and product information");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salesData,
          products,
          days,
          predictionMethod,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get predictions");
      }

      const result = await response.json();
      setPredictions(result.predictions);
      setTotalIngredients(result.totalIngredients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        }

        if (data.salesData && Array.isArray(data.salesData)) {
          setSalesData(data.salesData);
        }
      } catch (err) {
        setError("Failed to parse the uploaded file");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Bakery Demand Forecasting
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data Input</label>
            <div className="flex space-x-4">
              <button
                onClick={loadSampleData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Load Sample Data
              </button>
              <label className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md cursor-pointer hover:bg-gray-300">
                Upload JSON
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Prediction Days
              </label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
              >
                <option value={1}>1 Day</option>
                <option value={3}>3 Days</option>
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Prediction Method
              </label>
              <select
                value={predictionMethod}
                onChange={(e) => setPredictionMethod(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="moving">Moving Average</option>
                <option value="weighted">Weighted Average</option>
                <option value="seasonal">Seasonal (Weekly)</option>
                <option value="linear">Linear Regression (AI)</option>
                <option value="lstm">LSTM Neural Network (AI)</option>
              </select>
            </div>
          </div>

          <div>
            <button
              onClick={handlePredict}
              className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              disabled={
                isLoading || salesData.length === 0 || products.length === 0
              }
            >
              {isLoading ? "Calculating..." : "Predict Inventory Needs"}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>

      {products.length > 0 && salesData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Data Summary</h3>
          <p>Products: {products.length}</p>
          <p>Sales Records: {salesData.length}</p>
          <p>
            Date Range:{" "}
            {salesData.length > 0
              ? `${
                  salesData.sort((a, b) => a.date.localeCompare(b.date))[0].date
                } to 
             ${salesData.sort((a, b) => b.date.localeCompare(a.date))[0].date}`
              : "N/A"}
          </p>
        </div>
      )}

      {predictions.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Forecast Results</h3>
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <ProductForecast
                  key={prediction.productId}
                  prediction={prediction}
                />
              ))}
            </div>
          </div>

          <IngredientForecastChart
            totalIngredients={totalIngredients}
            currentStock={currentStock}
          />

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">
              Total Ingredients Needed
            </h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Ingredient</th>
                  <th className="text-right py-2">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(totalIngredients).map(
                  ([ingredient, amount]) => (
                    <tr key={ingredient} className="border-b">
                      <td className="py-2">{ingredient}</td>
                      <td className="text-right py-2">
                        {amount.toFixed(2)}{" "}
                        {ingredient === "water" ? "liters" : "kg"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
