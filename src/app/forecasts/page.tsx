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
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { ForecastChart } from "@/components/forecasts/ForecastChart";
import { ForecastTable } from "@/components/forecasts/ForecastTable";
import { IngredientRequirementsChart } from "@/components/forecasts/IngredientRequirementsChart";
// Remove ForecastControls import since we're not using it anymore

// Define proper types
interface Recipe {
  id: number;
  name: string;
}

interface ForecastParams {
  days: number;
  forecastDays: number;
  windowSize: number;
  method?: string;
}

interface ForecastData {
  recipeId: number;
  recipeName: string;
  dates: string[];
  actualQuantities: (number | null)[];
  predictedQuantities: (number | null)[];
  confidenceLevel: number;
}

interface IngredientRequirement {
  id: number;
  name: string;
  unit: string;
  requiredAmount: number;
  currentStock: number;
  category: string;
}

export default function ForecastsPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Set fixed values for forecast parameters
  const [forecastParams] = useState<ForecastParams>({
    days: 365, // 365 days of historical data
    forecastDays: 7, // 7 days forecast horizon
    windowSize: 7, // 7 days window size
    method: "standard",
  });
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(true);
  const [ingredientRequirements, setIngredientRequirements] = useState<
    IngredientRequirement[]
  >([]);
  const [isLoadingIngredients, setIsLoadingIngredients] =
    useState<boolean>(false);

  // Fetch recipes on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoadingRecipes(true);
      try {
        const response = await fetch("/api/recipes");
        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }
        const data = await response.json();
        setRecipes(data as Recipe[]); // Add type assertion here
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch recipes"
        );
        console.error(err);
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    fetchRecipes();
  }, []);

  // Calculate ingredient requirements when forecast data is available
  useEffect(() => {
    const calculateIngredientRequirements = async () => {
      if (!forecastData) return;

      setIsLoadingIngredients(true);
      try {
        // Calculate total forecasted quantity for the next 7 days
        const forecastedQuantities = forecastData.predictedQuantities.filter(
          (q) => q !== null
        ) as number[];

        // Sum up the forecasted quantities
        const totalForecastedQuantity = forecastedQuantities.reduce(
          (sum, qty) => sum + qty,
          0
        );

        // Fetch ingredient requirements
        const response = await fetch("/api/ingredient-requirements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipeId: forecastData.recipeId,
            forecastQuantity: totalForecastedQuantity,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to calculate ingredient requirements"
          );
        }

        const data = await response.json();
        setIngredientRequirements(data.requirements);
      } catch (err) {
        console.error("Error calculating ingredient requirements:", err);
        // Don't set error state here to avoid overriding forecast errors
      } finally {
        setIsLoadingIngredients(false);
      }
    };

    calculateIngredientRequirements();
  }, [forecastData]);

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

      // Type guard to ensure we have valid forecast data
      if (!data.forecast || typeof data.forecast !== "object") {
        throw new Error("Invalid forecast data received");
      }

      // Ensure all required properties exist in the forecast
      const requiredProps = [
        "recipeId",
        "recipeName",
        "dates",
        "actualQuantities",
        "predictedQuantities",
        "confidenceLevel",
      ];
      for (const prop of requiredProps) {
        if (!(prop in data.forecast)) {
          throw new Error(`Forecast data missing required property: ${prop}`);
        }
      }

      setForecastData(data.forecast as ForecastData);
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
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
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

                {/* Information about forecast parameters */}
                <div className="text-sm text-gray-500 mt-4">
                  <p>About Forecast:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>365 days of historical sales data</li>
                    <li>Forecasted sales for the next 7 days</li>
                    <li>
                      Applied LSTM, LSTM (Long Short-Term Memory) is a type of
                      artificial intelligence that helps computers remember
                      important past information to make better predictions.
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={generateForecast}
                  disabled={isLoading || !selectedRecipeId}
                  className="w-full mt-4"
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
                    <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                  </TabsList>
                  <TabsContent value="chart">
                    <ForecastChart data={forecastData} />
                  </TabsContent>
                  <TabsContent value="table">
                    <ForecastTable data={forecastData} />
                  </TabsContent>
                  <TabsContent value="ingredients">
                    {isLoadingIngredients ? (
                      <div className="flex flex-col items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p>Calculating ingredient requirements...</p>
                      </div>
                    ) : ingredientRequirements.length > 0 ? (
                      <IngredientRequirementsChart
                        data={ingredientRequirements}
                        recipeName={forecastData.recipeName}
                      />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <p>No ingredient data available for this recipe</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p>
                        Generating forecast... Please wait a few minutes as the
                        data is analyzed and predictions are made.
                      </p>
                    </div>
                  ) : (
                    <p>
                      Select a recipe and generate a forecast to see results
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
