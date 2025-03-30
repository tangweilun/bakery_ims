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

export default function ForecastDetailPage() {
  const params = useParams();
  const [forecast, setForecast] = useState<ForecastDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !forecast) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-red-500 mb-4">
                {error || "Forecast not found"}
              </p>
              <Button asChild>
                <Link href="/dashboard/forecasts/saved">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forecasts
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const factorsObj = forecast.factors ? JSON.parse(forecast.factors) : {};

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Forecast Details</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/forecasts/saved">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forecasts
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Forecast Visualization</CardTitle>
            <CardDescription>
              Visual representation of actual and predicted sales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForecastChart
              data={{
                dates: forecast.dates,
                actualQuantities: forecast.actualQuantities,
                predictedQuantities: forecast.predictedQuantities,
                recipeName: forecast.recipeName,
                confidenceLevel: forecast.confidenceLevel || 0,
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Basic forecast information</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <dd className="mt-1">{forecast.forecastQuantity.toFixed(0)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Confidence
                </dt>
                <dd className="mt-1">
                  {forecast.confidenceLevel
                    ? `${(forecast.confidenceLevel * 100).toFixed(0)}%`
                    : "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1">
                  {format(parseISO(forecast.createdAt), "MMM d, yyyy HH:mm")}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Information</CardTitle>
            <CardDescription>
              Technical details about the forecast
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Method</dt>
                <dd className="mt-1">{factorsObj.method || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Model Type
                </dt>
                <dd className="mt-1">{factorsObj.model || "N/A"}</dd>
              </div>
              {forecast.notes && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1">{forecast.notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
