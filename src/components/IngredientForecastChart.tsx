import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface IngredientChartProps {
  totalIngredients: {
    [ingredient: string]: number;
  };
  currentStock?: {
    [ingredient: string]: number;
  };
}

const IngredientForecastChart: React.FC<IngredientChartProps> = ({
  totalIngredients,
  currentStock = {},
}) => {
  // Sample current stock data if none provided
  const [stockLevels, setStockLevels] = useState<{
    [ingredient: string]: number;
  }>(
    Object.keys(currentStock).length > 0
      ? currentStock
      : {
          flour: 25,
          water: 50,
          salt: 5,
          yeast: 2,
          butter: 10,
          sugar: 15,
        }
  );

  // Prepare data for the chart
  const chartData = Object.keys(totalIngredients).map((ingredient) => ({
    name: ingredient,
    current: stockLevels[ingredient] || 0,
    predicted: totalIngredients[ingredient],
  }));

  const handleStockChange = (ingredient: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setStockLevels((prev) => ({
        ...prev,
        [ingredient]: numValue,
      }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">
        Ingredient Stock vs Predicted Demand
      </h3>

      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">Current Stock Levels</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(totalIngredients).map((ingredient) => (
            <div key={ingredient} className="flex items-center">
              <label className="block mr-2">{ingredient}:</label>
              <input
                type="number"
                value={stockLevels[ingredient] || 0}
                onChange={(e) => handleStockChange(ingredient, e.target.value)}
                className="w-24 p-1 border rounded"
                min="0"
                step="0.1"
              />
              <span className="ml-1 text-sm text-gray-600">
                {ingredient === "water" ? "liters" : "kg"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                `${(value as number).toFixed(2)} ${
                  name === "water" ? "liters" : "kg"
                }`,
                name === "current" ? "Current Stock" : "Predicted Demand",
              ]}
            />
            <Legend />
            <Bar dataKey="current" name="Current Stock" fill="#82ca9d" />
            <Bar dataKey="predicted" name="Predicted Demand" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <h4 className="text-md font-medium mb-2">Stock Analysis</h4>
        <div className="space-y-2">
          {Object.keys(totalIngredients).map((ingredient) => {
            const current = stockLevels[ingredient] || 0;
            const needed = totalIngredients[ingredient];
            const difference = current - needed;
            const status =
              difference >= 0
                ? "Sufficient"
                : difference >= -needed * 0.2
                ? "Low"
                : "Critical";
            const statusColor =
              difference >= 0
                ? "text-green-600"
                : difference >= -needed * 0.2
                ? "text-yellow-600"
                : "text-red-600";

            return (
              <div
                key={ingredient}
                className="flex justify-between border-b pb-1"
              >
                <span>{ingredient}</span>
                <span className={statusColor}>
                  {status}: {Math.abs(difference).toFixed(2)}{" "}
                  {ingredient === "water" ? "liters" : "kg"}
                  {difference < 0 ? " needed" : " excess"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IngredientForecastChart;
