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
import { Loader2, FileBarChart, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";

interface Forecast {
  id: number;
  recipeId: number;
  Recipe: {
    name: string;
  } | null;
  recipeName?: string; // Add the recipeName field
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
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [forecastToDelete, setForecastToDelete] = useState<number | null>(null);

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

  const openDeleteDialog = (id: number) => {
    setForecastToDelete(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setForecastToDelete(null);
  };

  const deleteForecast = async () => {
    if (!forecastToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/forecasts/${forecastToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete forecast");
      }

      toast.success("Forecast deleted successfully");
      closeDeleteDialog();
      fetchForecasts();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete forecast"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

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
          <h2 className="text-3xl font-bold tracking-tight">Saved Forecasts</h2>
          <Button asChild>
            <Link href="/forecasts">New Forecast</Link>
          </Button>
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
                          {forecast.recipeName ||
                            forecast.Recipe?.name ||
                            "Unknown Recipe"}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(forecast.startDate), "MMM d, yyyy")}{" "}
                          - {format(parseISO(forecast.endDate), "MMM d, yyyy")}
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
                              <Link href={`/forecasts/details/${forecast.id}`}>
                                <FileBarChart className="h-4 w-4" />
                                <span className="sr-only">View Details</span>
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openDeleteDialog(forecast.id)}
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this forecast? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={closeDeleteDialog}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deleteForecast}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
