"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { format, parseISO } from "date-fns";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ForecastChartProps {
  data: {
    dates: string[];
    actualQuantities: (number | null)[];
    predictedQuantities: (number | null)[];
    recipeName: string;
    confidenceLevel: number;
  };
}

export function ForecastChart({ data }: ForecastChartProps) {
  const chartRef = useRef<ChartJS>(null);

  // Format dates for display
  const formattedDates = data.dates.map((date) =>
    format(parseISO(date), "MMM d")
  );

  // Find the index where predictions start (where actual data ends)
  const predictionStartIndex = data.actualQuantities.findIndex(
    (q) => q === null
  );

  // Format confidence level as percentage
  const confidencePercentage = Math.round(data.confidenceLevel * 100);

  const chartData: ChartData<"line"> = {
    labels: formattedDates,
    datasets: [
      {
        label: "Actual Sales",
        data: data.actualQuantities,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        pointRadius: 3,
        tension: 0.1,
      },
      {
        label: "Predicted Sales",
        data: data.predictedQuantities,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        pointRadius: 3,
        borderDash: [5, 5],
        tension: 0.1,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Sales Forecast for ${data.recipeName} (${confidencePercentage}% Confidence)`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return `Date: ${data.dates[index]}`;
          },
          label: (context) => {
            const value = context.raw as number;
            if (value === null) return "";
            return `${context.dataset.label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        title: {
          display: true,
          text: "Quantity",
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        tension: 0.3,
      },
    },
  };

  // Add useEffect for debugging specific variables
  useEffect(() => {
    console.log("[DEBUG] ForecastChart data:", {
      dates: data.dates.length,
      actualQuantities: data.actualQuantities,
      predictedQuantities: data.predictedQuantities,
      predictionStartIndex,
      recipeName: data.recipeName,
      confidenceLevel: data.confidenceLevel,
    });

    // Log specific variable calculations
    console.log("[DEBUG] Prediction data:", {
      firstPredictionDate: data.dates[predictionStartIndex] || "N/A",
      totalPredictions: data.predictedQuantities.filter((p) => p !== null)
        .length,
      maxPredictedValue: Math.max(
        ...(data.predictedQuantities.filter((p) => p !== null) as number[])
      ),
    });
  }, [data, predictionStartIndex]);

  // Get confidence level description based on percentage
  const getConfidenceDescription = (level: number): string => {
    if (level >= 0.8) return "Very High";
    if (level >= 0.6) return "High";
    if (level >= 0.4) return "Moderate";
    if (level >= 0.2) return "Low";
    return "Very Low";
  };

  return (
    <div>
      <div className="h-[400px]">
        <Line
          ref={chartRef as React.RefObject<ChartJS<"line">>}
          data={chartData}
          options={chartOptions}
        />
      </div>
      
      {/* Confidence level explanation */}
      <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
        <h3 className="text-sm font-medium mb-2">About Forecast Confidence</h3>
        <div className="flex items-center mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                confidencePercentage >= 70 ? 'bg-green-600' : 
                confidencePercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ width: `${confidencePercentage}%` }}
            ></div>
          </div>
          <span className="ml-2 text-sm font-medium">{confidencePercentage}%</span>
        </div>
        <p className="text-sm text-gray-600">
          <span className="font-medium">
            {getConfidenceDescription(data.confidenceLevel)} Confidence:
          </span>{' '}
          This forecast has a {confidencePercentage}% confidence level, indicating 
          {data.confidenceLevel >= 0.6 
            ? " high reliability based on historical sales patterns." 
            : data.confidenceLevel >= 0.4 
              ? " moderate reliability. Consider additional factors when planning." 
              : " lower reliability. Use with caution and consider other business factors."
          }
        </p>
        <p className="text-sm text-gray-600 mt-1">
          The confidence level is calculated by analyzing how well the model predicts known historical data.
        </p>
      </div>
    </div>
  );
}
