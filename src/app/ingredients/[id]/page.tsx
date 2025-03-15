"use client";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Search } from "@/components/search";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock data for demonstration
const ingredientsData = [
  {
    id: "1",
    name: "All-Purpose Flour",
    category: "Dry Goods",
    unit: "kg",
    supplier: "Baker's Supply Co.",
    reorderPoint: 20,
    totalStock: 75,
    batches: [
      {
        id: "B001",
        quantity: 25,
        expirationDate: "2024-12-15",
        purchaseDate: "2023-06-01",
      },
      {
        id: "B002",
        quantity: 25,
        expirationDate: "2024-12-20",
        purchaseDate: "2023-06-15",
      },
      {
        id: "B003",
        quantity: 25,
        expirationDate: "2024-12-25",
        purchaseDate: "2023-07-01",
      },
    ],
  },
  {
    id: "2",
    name: "Granulated Sugar",
    category: "Dry Goods",
    unit: "kg",
    supplier: "Sweet Ingredients Inc.",
    reorderPoint: 15,
    totalStock: 45,
    batches: [
      {
        id: "B004",
        quantity: 20,
        expirationDate: "2024-11-30",
        purchaseDate: "2023-05-15",
      },
      {
        id: "B005",
        quantity: 25,
        expirationDate: "2024-12-05",
        purchaseDate: "2023-06-01",
      },
    ],
  },
  // ... other ingredients
];

// Define the ingredient type explicitly
type Batch = {
  id: string;
  quantity: number;
  expirationDate: string;
  purchaseDate: string;
};

type Ingredient = {
  id: string;
  name: string;
  category: string;
  unit: string;
  supplier: string;
  reorderPoint: number;
  totalStock: number;
  batches: Batch[];
};

export default function IngredientDetailPage() {
  const params = useParams();
  // Initialize with the correct type
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchedIngredient = ingredientsData.find(
      (ing) => ing.id === params.id
    );
    if (fetchedIngredient) {
      setIngredient(fetchedIngredient);
    }
  }, [params.id]);

  if (!ingredient) {
    return <div>Loading...</div>;
  }

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
            {ingredient.name}
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Link href="/inventory" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Inventory
              </Link>
            </Button>
            <Button>
              <Link
                href={`/inventory/purchase?id=${ingredient.id}`}
                className="flex items-center"
              >
                Purchase More
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ingredient.totalStock} {ingredient.unit}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ingredient.category}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ingredient.supplier}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reorder Point
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ingredient.reorderPoint} {ingredient.unit}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Batch Details</CardTitle>
            <CardDescription>
              Breakdown of current stock by batch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Expiration Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredient.batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.id}</TableCell>
                    <TableCell>
                      {batch.quantity} {ingredient.unit}
                    </TableCell>
                    <TableCell>{batch.purchaseDate}</TableCell>
                    <TableCell>{batch.expirationDate}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant={
                                new Date(batch.expirationDate) > new Date()
                                  ? "outline"
                                  : "destructive"
                              }
                            >
                              {new Date(batch.expirationDate) > new Date()
                                ? "Active"
                                : "Expired"}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {new Date(batch.expirationDate) > new Date()
                                ? `Expires in ${Math.ceil(
                                    (new Date(batch.expirationDate).getTime() -
                                      new Date().getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  )} days`
                                : `Expired ${Math.ceil(
                                    (new Date().getTime() -
                                      new Date(
                                        batch.expirationDate
                                      ).getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  )} days ago`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
