"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpiringBatch {
  id: number;
  ingredientId: number;
  quantity: number;
  unit: string;
  expiryDate: string;
  ingredient: {
    name: string;
    category: string;
  };
}

export function ExpiringIngredients() {
  const [expiringBatches, setExpiringBatches] = useState<ExpiringBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpiringBatches = async () => {
      try {
        const response = await fetch("/api/batches/expiring", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch expiring batches");
        }
        const data = await response.json();
        setExpiringBatches(data.expiringBatches);
      } catch (err) {
        console.error("Error fetching expiring batches:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpiringBatches();
  }, []);

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-32 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        {error}
      </div>
    );
  }

  if (expiringBatches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No ingredients expiring in the next 7 days.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ingredient</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expiringBatches.map((batch) => {
            const expiryDate = new Date(batch.expiryDate);
            const today = new Date();
            const daysUntilExpiry = Math.ceil(
              (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            let status: "default" | "destructive" | "outline" | "secondary" =
              "default";
            if (daysUntilExpiry <= 2) {
              status = "destructive";
            } else if (daysUntilExpiry <= 4) {
              status = "secondary"; // Using "secondary" instead of "warning"
            } else {
              status = "default";
            }

            return (
              <TableRow key={batch.id}>
                <TableCell className="font-medium">
                  {batch.ingredient.name}
                </TableCell>
                <TableCell>{batch.ingredient.category}</TableCell>
                <TableCell>
                  {batch.quantity} {batch.unit}
                </TableCell>
                <TableCell>
                  {format(new Date(batch.expiryDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge variant={status}>
                    {daysUntilExpiry === 0
                      ? "Expires today"
                      : daysUntilExpiry === 1
                      ? "Expires tomorrow"
                      : `Expires in ${daysUntilExpiry} days`}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
