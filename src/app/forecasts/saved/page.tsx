"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, FileBarChart, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

interface Forecast {
  id: number;
  recipeId: number;
  Recipe: {
    name: string;
  } | null;
  startDate: string;
  endDate: string;
  forecastQuantity: number;
  confidenceLevel: number;
  factors: string;
  createdAt: string;
}

export default function SavedForecastsPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecasts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/forecasts");

      if (!response.ok) {
        throw new Error("Failed to fetch forecasts");
      }

      const data = await response.json();
      setForecasts(data.forecasts);
    } catch (err) {
      if (err instanceof Error) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error(err);
        toast.error("Failed to fetch forecasts" + err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteForecast = async (id: number) => {
    if (!confirm("Are you sure you want to delete this forecast?")) {
      return;
    }

    try {
      const response = await fetch(`/api/forecasts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete forecast");
      }

      toast.success("Forecast deleted successfully");

      // Refresh the list
      fetchForecasts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete forecast" + err);
    }
    // Refresh the lis
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Saved Forecasts</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchForecasts}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/dashboard/forecasts">New Forecast</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Forecast History</CardTitle>
          <CardDescription>
            View all previously generated demand forecasts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : forecasts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No forecasts found. Generate a new forecast to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipe</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">
                      Forecast Quantity
                    </TableHead>
                    <TableHead className="text-right">Confidence</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecasts.map((forecast) => (
                    <TableRow key={forecast.id}>
                      <TableCell>
                        {forecast.Recipe?.name || "Unknown Recipe"}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(forecast.startDate), "MMM d, yyyy")} -{" "}
                        {format(parseISO(forecast.endDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        {forecast.forecastQuantity.toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {forecast.confidenceLevel
                          ? `${(forecast.confidenceLevel * 100).toFixed(0)}%`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(forecast.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link
                              href={`/dashboard/forecasts/details/${forecast.id}`}
                            >
                              <FileBarChart className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteForecast(forecast.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
