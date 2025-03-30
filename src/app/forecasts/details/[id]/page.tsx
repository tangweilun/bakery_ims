"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { ForecastChart } from "@/components/forecasts/ForecastChart";
import { ForecastTable } from "@/components/forecasts/ForecastTable";
import { IngredientRequirementsChart } from "@/components/forecasts/IngredientRequirementsChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";

interface ForecastDetail {
  id: number;
  recipeId: number;
  startDate: string;
  endDate: string;
  forecastQuantity: number;
  confidenceLevel: number | null;
  factors: string;
  notes: string | null;
  createdAt: string;
  dates: string[];
  actualQuantities: number[];
  predictedQuantities: number[];
  recipeName: string;
}

interface IngredientRequirement {
  id: number;
  name: string;
  unit: string;
  requiredAmount: number;
  currentStock: number;
  category: string;
}

export default function ForecastDetailPage() {
  const params = useParams();
  const [forecast, setForecast] = useState<ForecastDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ingredientRequirements, setIngredientRequirements] = useState<
    IngredientRequirement[]
  >([]);
  const [isLoadingIngredients, setIsLoadingIngredients] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchForecastDetail = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/forecasts/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch forecast details");
        const data = await response.json();
        setForecast(data.forecast);
      } catch (err) {
        console.error("[DEBUG] Error fetching forecast:", err);
        setError("Failed to load forecast details");
        toast.error("Failed to load forecast details");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchForecastDetail();
    }
  }, [params.id]);

  // Fetch ingredient requirements when forecast data is loaded
  useEffect(() => {
    const fetchIngredientRequirements = async () => {
      if (!forecast) return;

      setIsLoadingIngredients(true);
      try {
        const response = await fetch("/api/ingredient-requirements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipeId: forecast.recipeId,
            forecastQuantity: forecast.forecastQuantity,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch ingredient requirements");
        }

        const data = await response.json();
        setIngredientRequirements(data.requirements);
      } catch (err) {
        console.error("Error fetching ingredient requirements:", err);
        toast.error("Failed to load ingredient requirements");
      } finally {
        setIsLoadingIngredients(false);
      }
    };

    if (forecast) {
      fetchIngredientRequirements();
    }
  }, [forecast]);

  if (isLoading) {
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
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !forecast) {
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
        <div className="flex-1 p-8 pt-6">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-red-500 mb-4">
                  {error || "Forecast not found"}
                </p>
                <Button asChild>
                  <Link href="/forecasts/saved">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forecasts
                    History
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const factorsObj = forecast.factors ? JSON.parse(forecast.factors) : {};

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
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Forecast Details
          </h2>
          <Button variant="outline" asChild>
            <Link href="/forecasts/saved">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forecasts History
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Forecast Overview</CardTitle>
              <CardDescription>Basic forecast information</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Recipe</dt>
                  <dd className="mt-1 font-medium">{forecast.recipeName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Period</dt>
                  <dd className="mt-1">
                    {format(parseISO(forecast.startDate), "MMM d, yyyy")} -{" "}
                    {format(parseISO(forecast.endDate), "MMM d, yyyy")}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Forecast Quantity
                  </dt>
                  <dd className="mt-1">
                    {forecast.forecastQuantity.toFixed(0)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Confidence Level
                  </dt>
                  <dd className="mt-1">
                    {forecast.confidenceLevel
                      ? `${(forecast.confidenceLevel * 100).toFixed(2)}%`
                      : "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Forecast Method
                  </dt>
                  <dd className="mt-1">
                    {factorsObj.method || "Standard"} (
                    {factorsObj.model || "N/A"})
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Created At
                  </dt>
                  <dd className="mt-1">
                    {format(parseISO(forecast.createdAt), "MMM d, yyyy h:mm a")}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forecast Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chart">
                <TabsList className="mb-4">
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                  <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                </TabsList>

                <TabsContent value="chart">
                  <ForecastChart
                    data={{
                      dates: forecast.dates,
                      actualQuantities: forecast.actualQuantities,
                      predictedQuantities: forecast.predictedQuantities,
                      recipeName: forecast.recipeName,
                      confidenceLevel: forecast.confidenceLevel || 0,
                    }}
                  />
                </TabsContent>

                <TabsContent value="table">
                  <ForecastTable
                    data={{
                      dates: forecast.dates,
                      actualQuantities: forecast.actualQuantities,
                      predictedQuantities: forecast.predictedQuantities,
                      recipeName: forecast.recipeName,
                      // Remove confidenceLevel since it's not in the expected type
                    }}
                  />
                </TabsContent>

                <TabsContent value="ingredients">
                  {isLoadingIngredients ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mr-2" />
                      <span>Loading ingredient requirements...</span>
                    </div>
                  ) : ingredientRequirements.length > 0 ? (
                    <IngredientRequirementsChart
                      data={ingredientRequirements}
                      recipeName={forecast.recipeName}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No ingredient data available for this recipe.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {forecast.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{forecast.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
