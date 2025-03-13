"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Search } from "@/components/search";
import Link from "next/link";
import { ArrowLeft, Loader2, Scan, ShoppingCart } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const ingredientsData = [
  {
    id: 1,
    name: "All-Purpose Flour",
    category: "Dry Goods",
    unit: "kg",
    supplier: "Baker's Supply Co.",
    defaultQuantity: 25,
    lastPurchaseDate: "2023-05-15",
    lastBatchNumber: "LOT-F12345",
    suggestedBatchNumber: "LOT-F12346",
    reorderPoint: 20,
    currentStock: 25,
  },
  {
    id: 2,
    name: "Granulated Sugar",
    category: "Dry Goods",
    unit: "kg",
    supplier: "Sweet Ingredients Inc.",
    defaultQuantity: 20,
    lastPurchaseDate: "2023-05-10",
    lastBatchNumber: "LOT-S67890",
    suggestedBatchNumber: "LOT-S67891",
    reorderPoint: 15,
    currentStock: 15,
  },
  {
    id: 3,
    name: "Butter",
    category: "Dairy",
    unit: "kg",
    supplier: "Dairy Fresh Supplies",
    defaultQuantity: 10,
    lastPurchaseDate: "2023-05-20",
    lastBatchNumber: "LOT-B24680",
    suggestedBatchNumber: "LOT-B24681",
    reorderPoint: 8,
    currentStock: 5,
  },
  {
    id: 4,
    name: "Eggs",
    category: "Dairy",
    unit: "pcs",
    supplier: "Farm Fresh Eggs",
    defaultQuantity: 360,
    lastPurchaseDate: "2023-05-25",
    lastBatchNumber: "LOT-E13579",
    suggestedBatchNumber: "LOT-E13580",
    reorderPoint: 180,
    currentStock: 120,
  },
  {
    id: 5,
    name: "Milk",
    category: "Dairy",
    unit: "L",
    supplier: "Dairy Fresh Supplies",
    defaultQuantity: 20,
    lastPurchaseDate: "2023-05-28",
    lastBatchNumber: "LOT-M97531",
    suggestedBatchNumber: "LOT-M97532",
    reorderPoint: 10,
    currentStock: 8,
  },
];

interface Ingredient {
  id: number;
  name: string;
  category: string;
  unit: string;
  supplier: string;
  defaultQuantity: number;
  lastPurchaseDate: string;
  lastBatchNumber: string;
  suggestedBatchNumber: string;
  reorderPoint: number;
  currentStock: number;
}

export default function PurchaseIngredientPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [quantity, setQuantity] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [date, setDate] = useState(new Date());
  const [useDefaultSupplier, setUseDefaultSupplier] = useState(true);
  const [supplier, setSupplier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Simulate loading ingredient data
  useEffect(() => {
    if (id) {
      const ingredient = ingredientsData.find(
        (ing) => ing.id === Number.parseInt(id)
      );
      if (ingredient) {
        setSelectedIngredient(ingredient);
        setQuantity(ingredient.defaultQuantity.toString());
        setBatchNumber(ingredient.suggestedBatchNumber);
        setSupplier(ingredient.supplier);
      }
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect would happen here in a real app
      alert("Purchase recorded successfully!");
    }, 1500);
  };

  const simulateScan = () => {
    setIsScanning(true);

    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      setBatchNumber("SCAN-" + Math.floor(Math.random() * 10000));
    }, 2000);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
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
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Link href="/inventory" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Purchase Existing Ingredient
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ingredient">Ingredient</Label>
                {id ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      id="ingredient"
                      value={selectedIngredient?.name || ""}
                      disabled
                      className="bg-muted"
                    />
                    <Link href="/inventory/purchase">
                      <Button variant="outline" type="button">
                        Change
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Select
                    onValueChange={(value) => {
                      const ingredient = ingredientsData.find(
                        (ing) => ing.id === Number.parseInt(value)
                      );
                      if (ingredient) {
                        setSelectedIngredient(ingredient);
                        setQuantity(ingredient.defaultQuantity.toString());
                        setBatchNumber(ingredient.suggestedBatchNumber);
                        setSupplier(ingredient.supplier);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ingredient" />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredientsData.map((ingredient) => (
                        <SelectItem
                          key={ingredient.id}
                          value={ingredient.id.toString()}
                        >
                          {ingredient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedIngredient && (
                <>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Current Stock
                          </p>
                          <p className="text-lg font-medium">
                            {selectedIngredient.currentStock}{" "}
                            {selectedIngredient.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Reorder Point
                          </p>
                          <p className="text-lg font-medium">
                            {selectedIngredient.reorderPoint}{" "}
                            {selectedIngredient.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Category
                          </p>
                          <p className="text-lg font-medium">
                            {selectedIngredient.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Last Purchase
                          </p>
                          <p className="text-lg font-medium">
                            {selectedIngredient.lastPurchaseDate}
                          </p>
                        </div>
                      </div>
                      {selectedIngredient.currentStock <=
                        selectedIngredient.reorderPoint && (
                        <div className="mt-4">
                          <Badge
                            variant="destructive"
                            className="w-full justify-center py-1 text-sm"
                          >
                            Low Stock - Reorder Recommended
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      Quantity ({selectedIngredient.unit})
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder={`Enter quantity in ${selectedIngredient.unit}`}
                    />
                    <p className="text-sm text-muted-foreground">
                      Typical purchase: {selectedIngredient.defaultQuantity}{" "}
                      {selectedIngredient.unit}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="batch">Batch/Lot Number</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={simulateScan}
                        disabled={isScanning}
                      >
                        {isScanning ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Scan className="mr-2 h-4 w-4" />
                            Scan Barcode
                          </>
                        )}
                      </Button>
                    </div>
                    <Input
                      id="batch"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      placeholder="Enter batch or lot number"
                    />
                    <p className="text-sm text-muted-foreground">
                      Suggested: {selectedIngredient.suggestedBatchNumber}
                    </p>
                  </div>
                </>
              )}
            </div>

            {selectedIngredient && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expiration">Expiration Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="default-supplier"
                    checked={useDefaultSupplier}
                    onCheckedChange={setUseDefaultSupplier}
                  />
                  <Label htmlFor="default-supplier">Use default supplier</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    disabled={useDefaultSupplier}
                    className={useDefaultSupplier ? "bg-muted" : ""}
                    placeholder="Enter supplier name"
                  />
                </div>

                <Tabs defaultValue="purchase-only">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="purchase-only">
                      Purchase Only
                    </TabsTrigger>
                    <TabsTrigger value="purchase-and-use">
                      Purchase & Use
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="purchase-only" className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                      Add this purchase to inventory without using it
                      immediately.
                    </p>
                  </TabsContent>
                  <TabsContent
                    value="purchase-and-use"
                    className="space-y-4 pt-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="recipe">Use in Recipe</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chocolate-cake">
                            Chocolate Cake
                          </SelectItem>
                          <SelectItem value="vanilla-cupcakes">
                            Vanilla Cupcakes
                          </SelectItem>
                          <SelectItem value="sourdough-bread">
                            Sourdough Bread
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="use-quantity">Quantity to Use</Label>
                      <Input
                        id="use-quantity"
                        type="number"
                        placeholder={`Enter quantity in ${
                          selectedIngredient?.unit || "units"
                        }`}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional notes"
                  />
                </div>
              </div>
            )}
          </div>

          {selectedIngredient && (
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Record Purchase
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
