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
        text: `Sales Forecast for ${data.recipeName}`,
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

  // // Add annotation to show where forecast begins
  // useEffect(() => {
  //   if (chartRef.current && predictionStartIndex > 0) {
  //     const chart = chartRef.current;

  //     // Add a vertical line annotation plugin if needed
  //     // This would require additional setup with chartjs-plugin-annotation
  //   }
  // }, [predictionStartIndex]);

  // Add useEffect for debugging specific variables
  useEffect(() => {
    console.log("[DEBUG] ForecastChart data:", {
      dates: data.dates.length,
      actualQuantities: data.actualQuantities,
      predictedQuantities: data.predictedQuantities,
      predictionStartIndex,
      recipeName: data.recipeName,
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

  return (
    <div className="h-[400px]">
      <Line
        ref={chartRef as React.RefObject<ChartJS<"line">>}
        data={chartData}
        options={chartOptions}
      />
    </div>
  );
}
