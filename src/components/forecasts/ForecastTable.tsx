"use client";

import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ForecastTableProps {
  data: {
    dates: string[];
    actualQuantities: (number | null)[];
    predictedQuantities: (number | null)[];
    recipeName: string;
  };
}

export function ForecastTable({ data }: ForecastTableProps) {
  // Find the index where predictions start
  const predictionStartIndex = data.actualQuantities.findIndex(
    (q) => q === null
  );

  // Create table rows with both actual and predicted data
  const tableRows = data.dates.map((date, index) => {
    const formattedDate = format(parseISO(date), "MMM d, yyyy");
    const actual = data.actualQuantities[index];
    const predicted = data.predictedQuantities[index];
    const isForecast = index >= predictionStartIndex;

    return {
      date: formattedDate,
      actual: actual !== null ? actual : "-",
      predicted: predicted !== null ? predicted : "-",
      isForecast,
    };
  });

  // Calculate totals
  const actualTotal = data.actualQuantities
    .filter((q) => q !== null)
    .reduce((sum, q) => sum + (q || 0), 0);

  const predictedTotal = data.predictedQuantities
    .filter((q) => q !== null)
    .reduce((sum, q) => sum + (q || 0), 0);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actual Sales</TableHead>
            <TableHead className="text-right">Predicted Sales</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableRows.map((row, i) => (
            <TableRow key={i} className={row.isForecast ? "bg-muted/50" : ""}>
              <TableCell>{row.date}</TableCell>
              <TableCell className="text-right">{row.actual}</TableCell>
              <TableCell className="text-right">{row.predicted}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold">
            <TableCell>Total</TableCell>
            <TableCell className="text-right">{actualTotal}</TableCell>
            <TableCell className="text-right">{predictedTotal}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
