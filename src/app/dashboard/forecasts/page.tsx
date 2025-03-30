"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { ForecastChart } from "@/components/forecasts/ForecastChart";
import { ForecastTable } from "@/components/forecasts/ForecastTable";
import { ForecastControls } from "@/components/forecasts/ForecastControls";

interface Recipe {
  id: number;
  name: string;
}

export default function ForecastsPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [forecastData, setForecastData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [forecastParams, setForecastParams] = useState({
    days: 90,
    forecastDays: 30,
    windowSize: 7,
  });
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(true);

  // Fetch recipes on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoadingRecipes(true);
      try {
        const response = await fetch("/api/recipes");
        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        setError("Failed to fetch recipes");
        console.error(err);
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    fetchRecipes();
  }, []);

  const generateForecast = async () => {
    if (!selectedRecipeId) {
      setError("Please select a recipe");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/forecasts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeId: parseInt(selectedRecipeId),
          ...forecastParams,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate forecast");
      }

      setForecastData(data.forecast);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Demand Forecasting</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Forecast Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Recipe
                </label>
                <Select
                  value={selectedRecipeId}
                  onValueChange={setSelectedRecipeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingRecipes ? (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Loading recipes...</span>
                      </div>
                    ) : recipes.length > 0 ? (
                      recipes.map((recipe) => (
                        <SelectItem
                          key={recipe.id}
                          value={recipe.id.toString()}
                        >
                          {recipe.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No recipes available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <ForecastControls
                params={forecastParams}
                onChange={setForecastParams}
              />

              <Button
                onClick={generateForecast}
                disabled={isLoading || !selectedRecipeId}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Forecast"
                )}
              </Button>

              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Forecast Results</CardTitle>
          </CardHeader>
          <CardContent>
            {forecastData ? (
              <Tabs defaultValue="chart">
                <TabsList className="mb-4">
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>
                <TabsContent value="chart">
                  <ForecastChart data={forecastData} />
                </TabsContent>
                <TabsContent value="table">
                  <ForecastTable data={forecastData} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Generating forecast...</p>
                  </div>
                ) : (
                  <p>Select a recipe and generate a forecast to see results</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
