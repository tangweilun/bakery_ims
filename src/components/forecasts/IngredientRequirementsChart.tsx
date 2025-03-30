"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { InfoIcon } from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface IngredientRequirement {
  id: number;
  name: string;
  unit: string;
  requiredAmount: number;
  currentStock: number;
  category: string;
}

interface IngredientRequirementsChartProps {
  data: IngredientRequirement[];
  recipeName: string;
}

export function IngredientRequirementsChart({
  data,
  recipeName,
}: IngredientRequirementsChartProps) {
  const [chartData, setChartData] = useState<ChartData<"bar">>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // Sort ingredients by category and name for better visualization
    const sortedData = [...data].sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });

    // Prepare data for chart
    const labels = sortedData.map((item) => `${item.name} (${item.unit})`);
    const requiredAmounts = sortedData.map((item) => item.requiredAmount);
    const currentStocks = sortedData.map((item) => item.currentStock);

    setChartData({
      labels,
      datasets: [
        {
          label: "Required Amount",
          data: requiredAmounts,
          backgroundColor: "rgba(255, 99, 132, 0.7)",
          borderColor: "rgb(255, 99, 132)",
          borderWidth: 1,
        },
        {
          label: "Current Stock",
          data: currentStocks,
          backgroundColor: "rgba(53, 162, 235, 0.7)",
          borderColor: "rgb(53, 162, 235)",
          borderWidth: 1,
        },
      ],
    });
  }, [data]);

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const, // Horizontal bar chart
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Ingredient Requirements for ${recipeName} Forecast`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            const dataIndex = context.dataIndex;
            const unit = data[dataIndex]?.unit || "";
            return `${context.dataset.label}: ${value} ${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Quantity",
        },
        beginAtZero: true,
      },
      y: {
        title: {
          display: true,
          text: "Ingredients",
        },
      },
    },
  };

  // Calculate which ingredients need restocking
  const lowStockIngredients = data.filter(
    (item) => item.requiredAmount > item.currentStock
  );

  return (
    <div>
      {/* Explanation section */}
      <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
        <div className="flex items-start">
          <InfoIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">About This Forecast</p>
            <p>
              This chart shows the ingredient requirements based on the forecasted sales for the next 7 days.
              The required amounts are calculated by multiplying the recipe&apos;s ingredient quantities by the 
              total predicted sales volume for the upcoming week.
            </p>
          </div>
        </div>
      </div>

      <div className="h-[400px]">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Low stock warning */}
      {lowStockIngredients.length > 0 && (
        <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-200">
          <h3 className="text-sm font-medium text-amber-800 mb-2">
            Ingredients Requiring Restocking
          </h3>
          <ul className="space-y-1">
            {lowStockIngredients.map((item) => (
              <li key={item.id} className="text-sm text-amber-700">
                <span className="font-medium">{item.name}</span>:{" "}
                {item.currentStock} {item.unit} available,{" "}
                {item.requiredAmount} {item.unit} required (
                {Math.round((item.requiredAmount - item.currentStock) * 100) / 100}{" "}
                {item.unit} shortage)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}