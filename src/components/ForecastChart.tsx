import React from "react";
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
import { PredictionResult } from "../app/model/type";

interface ForecastChartProps {
  predictions: PredictionResult[];
}

const ForecastChart: React.FC<ForecastChartProps> = ({ predictions }) => {
  // Prepare data for the chart - using the actual structure
  const chartData = predictions.map((prediction) => ({
    name: prediction.productName,
    quantity: prediction.predictedQuantity,
  }));

  // Generate colors for each product bar
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088fe",
    "#00C49F",
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Forecast Visualization</h3>

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
              formatter={(value) => [`${value} units`, "Predicted Quantity"]}
            />
            <Legend />
            <Bar dataKey="quantity" name="Predicted Quantity" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastChart;
