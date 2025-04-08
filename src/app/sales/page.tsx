// app/sales/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, XCircleIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserNav } from "@/components/user-nav";
import { MainNav } from "@/components/main-nav";
import { toast } from "react-toastify";
import { DeleteSaleDialog } from "./delete-dialog";
import { EditSaleDialog } from "./edit-dialog";

// Types for our data
type Recipe = {
  id: number;
  name: string;
  sellingPrice: number;
};

type SaleItem = {
  recipeId: number;
  quantity: number;
  unitPrice: number;
  recipe?: Recipe;
};

type Sale = {
  id: number;
  datetime: string;
  dayOfWeek: string;
  totalAmount: number;
  saleItems: SaleItem[];
};

export default function SalesPage() {
  // State management
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Filter states
  const [dateFilter, setDateFilter] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null,
  });
  const [dayFilter, setDayFilter] = useState<string | null>(null);
  const [recipeFilter, setRecipeFilter] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });

  const [newSale, setNewSale] = useState<{
    datetime: string;
    userId: string;
    saleItems: SaleItem[];
  }>({
    datetime: new Date().toISOString(),
    userId: "", // TODO: Get current user's ID
    saleItems: [],
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch sales
        const salesResponse = await fetch("/api/sales");
        if (!salesResponse.ok) {
          console.error("Sales API error:", salesResponse.status);
          setSales([]);
        } else {
          const salesData = await salesResponse.json();
          const salesWithSortedDates = (salesData.sales || []).sort(
            (a: Sale, b: Sale) =>
              new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
          );
          setSales(salesWithSortedDates);
          setFilteredSales(salesWithSortedDates);
        }

        // Fetch recipes
        const recipesResponse = await fetch("/api/recipes");
        if (!recipesResponse.ok) {
          console.error("Recipes API error:", recipesResponse.status);
          setRecipes([]);
        } else {
          const recipesData = await recipesResponse.json();
          setRecipes(recipesData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set default values in case of error
        setSales([]);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply all filters
  useEffect(() => {
    let result = [...sales];

    // Date filter
    if (dateFilter.from || dateFilter.to) {
      result = result.filter((sale) => {
        const saleDate = new Date(sale.datetime);

        // Check if sale date is after the "from" date (if specified)
        const isAfterFrom = dateFilter.from
          ? saleDate >= new Date(dateFilter.from.setHours(0, 0, 0, 0))
          : true;

        // Check if sale date is before the "to" date (if specified)
        const isBeforeTo = dateFilter.to
          ? saleDate <= new Date(dateFilter.to.setHours(23, 59, 59, 999))
          : true;

        return isAfterFrom && isBeforeTo;
      });
    }

    // Day of week filter
    if (dayFilter) {
      result = result.filter((sale) => sale.dayOfWeek === dayFilter);
    }

    // Recipe filter
    if (recipeFilter) {
      result = result.filter((sale) =>
        sale.saleItems.some((item) => item.recipeId === recipeFilter)
      );
    }

    // Price range filter
    if (priceRange.min !== "") {
      result = result.filter(
        (sale) => sale.totalAmount >= parseFloat(priceRange.min)
      );
    }
    if (priceRange.max !== "") {
      result = result.filter(
        (sale) => sale.totalAmount <= parseFloat(priceRange.max)
      );
    }

    setFilteredSales(result);
  }, [sales, dateFilter, dayFilter, recipeFilter, priceRange]);

  // Reset all filters
  const resetFilters = () => {
    setDateFilter({ from: null, to: null });
    setDayFilter(null);
    setRecipeFilter(null);
    setPriceRange({ min: "", max: "" });
  };

  // Handler to add sale item
  const addSaleItem = () => {
    if (recipes.length === 0) return;

    setNewSale((prev) => ({
      ...prev,
      saleItems: [
        ...prev.saleItems,
        {
          recipeId: recipes[0].id,
          quantity: 1,
          unitPrice: recipes[0].sellingPrice,
        },
      ],
    }));
  };

  // Handler to remove sale item
  const removeSaleItem = (index: number) => {
    setNewSale((prev) => ({
      ...prev,
      saleItems: prev.saleItems.filter((_, i) => i !== index),
    }));
  };

  // Calculate total amount
  const calculateTotal = () => {
    return newSale.saleItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  // Handler to create sale
  const handleCreateSale = async () => {
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newSale,
          dayOfWeek: new Date(newSale.datetime).toLocaleDateString("en-US", {
            weekday: "short",
          }),
        }),
      });

      if (response.ok) {
        const createdSale = await response.json();
        setSales((prev) => [createdSale, ...prev]);
        // Reset form
        setNewSale({
          datetime: new Date().toISOString(),
          userId: "",
          saleItems: [],
        });
        setOpen(false);
        toast.success("Sale created successfully!");
      } else {
        toast.error("Failed to create sale. Please try again.");
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.error("Error creating sale. Please try again later.");
    }
  };

  // Calculate sales statistics
  const calculateStats = () => {
    if (filteredSales.length === 0) return { total: 0, avg: 0, count: 0 };

    const total = filteredSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0
    );
    return {
      total: total.toFixed(2),
      avg: (total / filteredSales.length).toFixed(2),
      count: filteredSales.length,
    };
  };

  const stats = calculateStats();

  // Add these handler functions to the main SalesPage component
  // Handler to update sale
  const handleUpdateSale = async (updatedSale: Sale) => {
    try {
      toast.info("Updating sale...");
      const response = await fetch(`/api/sales/${updatedSale.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          datetime: updatedSale.datetime,
          dayOfWeek: updatedSale.dayOfWeek,
          saleItems: updatedSale.saleItems.map((item) => ({
            recipeId: item.recipeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }),
      });

      if (response.ok) {
        const updatedSaleData = await response.json();
        setSales((prev) =>
          prev.map((sale) =>
            sale.id === updatedSaleData.id ? updatedSaleData : sale
          )
        );
        toast.success("Sale updated successfully!");
      } else {
        toast.error("Failed to update sale. Please try again.");
      }
    } catch (error) {
      console.error("Error updating sale:", error);
      toast.error("Error updating sale. Please try again later.");
    }
  };

  // Handler to delete sale
  const handleDeleteSale = async (saleId: number) => {
    try {
      toast.info("Deleting sale...");
      const response = await fetch(`/api/sales/${saleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSales((prev) => prev.filter((sale) => sale.id !== saleId));
        toast.success("Sale deleted successfully!");
      } else {
        toast.error("Failed to delete sale. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Error deleting sale. Please try again later.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header/Navigation - always visible */}
      <div className="border-b bg-white shadow-sm">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Sales Management</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg">Create New Sale</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Sale</DialogTitle>
              </DialogHeader>

              {/* Sale Date */}
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Sale Date and Time</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={newSale.datetime.slice(0, 16)}
                    onChange={(e) =>
                      setNewSale((prev) => ({
                        ...prev,
                        datetime: new Date(e.target.value).toISOString(),
                      }))
                    }
                  />
                </div>

                {/* Sale Items */}
                <div className="space-y-3">
                  <Label>Sale Items</Label>
                  {newSale.saleItems.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No items added yet
                    </p>
                  )}
                  {newSale.saleItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Select
                        value={item.recipeId.toString()}
                        onValueChange={(value) => {
                          const selectedRecipe = recipes.find(
                            (r) => r.id === parseInt(value)
                          );
                          setNewSale((prev) => {
                            const newItems = [...prev.saleItems];
                            newItems[index] = {
                              ...newItems[index],
                              recipeId: parseInt(value),
                              unitPrice: selectedRecipe
                                ? selectedRecipe.sellingPrice
                                : 0.0,
                            };
                            return { ...prev, saleItems: newItems };
                          });
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Recipe" />
                        </SelectTrigger>
                        <SelectContent>
                          {recipes.map((recipe) => (
                            <SelectItem
                              key={recipe.id}
                              value={recipe.id.toString()}
                            >
                              {recipe.name} (${recipe.sellingPrice.toFixed(2)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        placeholder="Qty"
                        className="w-20"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const quantity = parseInt(e.target.value) || 1;
                          setNewSale((prev) => {
                            const newItems = [...prev.saleItems];
                            newItems[index].quantity = quantity;
                            return { ...prev, saleItems: newItems };
                          });
                        }}
                      />

                      <div className="text-sm w-16">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSaleItem(index)}
                      >
                        <XCircleIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={addSaleItem}>
                    Add Item
                  </Button>
                </div>

                {newSale.saleItems.length > 0 && (
                  <div className="text-right font-medium">
                    Total: ${calculateTotal().toFixed(2)}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSale}
                  disabled={newSale.saleItems.length === 0}
                >
                  Save Sale
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="sales" className="mb-6">
          <TabsList>
            <TabsTrigger value="sales">Sales Table</TabsTrigger>
            <TabsTrigger value="stats">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    disabled={
                      !dateFilter &&
                      !dayFilter &&
                      !recipeFilter &&
                      !priceRange.min &&
                      !priceRange.max
                    }
                  >
                    Reset Filters
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {/* Date Filter */}
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={dateFilter ? "default" : "outline"}
                          className="flex gap-2"
                        >
                          <CalendarIcon className="h-4 w-4" />
                          {dateFilter
                            ? `${
                                dateFilter.from
                                  ? format(dateFilter.from, "PP")
                                  : ""
                              } - ${
                                dateFilter.to ? format(dateFilter.to, "PP") : ""
                              }`
                            : "Filter by Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="range"
                          selected={{
                            from: dateFilter.from || undefined,
                            to: dateFilter.to || undefined,
                          }}
                          onSelect={(range) => {
                            setDateFilter({
                              from: range?.from || null,
                              to: range?.to || null,
                            });
                          }}
                          numberOfMonths={2}
                          required={false}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Day of Week Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={dayFilter ? "default" : "outline"}
                        className="flex gap-2"
                      >
                        {dayFilter || "Filter by Day"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {days.map((day) => (
                        <DropdownMenuItem
                          key={day}
                          onClick={() => setDayFilter(day)}
                        >
                          {day}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Recipe Filter */}
                  <Select
                    value={recipeFilter?.toString() || "none"}
                    onValueChange={(value) =>
                      setRecipeFilter(value ? parseInt(value) : null)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Recipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">All Recipes</SelectItem>
                      {recipes.map((recipe) => (
                        <SelectItem
                          key={recipe.id}
                          value={recipe.id.toString()}
                        >
                          {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Price Range */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min $"
                      className="w-24"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: e.target.value })
                      }
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      placeholder="Max $"
                      className="w-24"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Active filters display */}
                {(dateFilter.from ||
                  dateFilter.to ||
                  dayFilter ||
                  recipeFilter ||
                  priceRange.min ||
                  priceRange.max) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {dateFilter.from && (
                      <Badge
                        variant="secondary"
                        className="flex gap-1 items-center"
                      >
                        From: {format(dateFilter.from, "PP")}
                        <XCircleIcon
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            setDateFilter({ ...dateFilter, from: null })
                          }
                        />
                      </Badge>
                    )}
                    {dateFilter.to && (
                      <Badge
                        variant="secondary"
                        className="flex gap-1 items-center"
                      >
                        To: {format(dateFilter.to, "PP")}
                        <XCircleIcon
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            setDateFilter({ ...dateFilter, to: null })
                          }
                        />
                      </Badge>
                    )}
                    {dayFilter && (
                      <Badge
                        variant="secondary"
                        className="flex gap-1 items-center"
                      >
                        Day: {dayFilter}
                        <XCircleIcon
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => setDayFilter(null)}
                        />
                      </Badge>
                    )}
                    {recipeFilter && (
                      <Badge
                        variant="secondary"
                        className="flex gap-1 items-center"
                      >
                        Recipe:{" "}
                        {recipes.find((r) => r.id === recipeFilter)?.name}
                        <XCircleIcon
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => setRecipeFilter(null)}
                        />
                      </Badge>
                    )}
                    {priceRange.min && (
                      <Badge
                        variant="secondary"
                        className="flex gap-1 items-center"
                      >
                        Min: ${priceRange.min}
                        <XCircleIcon
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            setPriceRange({ ...priceRange, min: "" })
                          }
                        />
                      </Badge>
                    )}
                    {priceRange.max && (
                      <Badge
                        variant="secondary"
                        className="flex gap-1 items-center"
                      >
                        Max: ${priceRange.max}
                        <XCircleIcon
                          className="h-3 w-3 cursor-pointer"
                          onClick={() =>
                            setPriceRange({ ...priceRange, max: "" })
                          }
                        />
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sales Table */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Records ({filteredSales.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading sales data...</div>
                ) : filteredSales.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead className="text-right">
                          Total Amount
                        </TableHead>
                        <TableHead>Items</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>
                            {format(new Date(sale.datetime), "PP")}
                          </TableCell>
                          <TableCell>{sale.dayOfWeek}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${sale.totalAmount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {sale.saleItems.map((item, i) => (
                              <span key={i} className="block text-sm">
                                {item.quantity} x {item.recipe?.name}
                              </span>
                            ))}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    Edit
                                  </Button>
                                </DialogTrigger>
                                <EditSaleDialog
                                  sale={sale}
                                  recipes={recipes}
                                  onSave={handleUpdateSale}
                                />
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    Delete
                                  </Button>
                                </DialogTrigger>
                                <DeleteSaleDialog
                                  sale={sale}
                                  onDelete={handleDeleteSale}
                                />
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No sales found matching the current filters
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    From {filteredSales.length} sales
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Sale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.avg}</div>
                  <p className="text-xs text-muted-foreground">
                    Per transaction
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.count}</div>
                  <p className="text-xs text-muted-foreground">
                    {dateFilter
                      ? "On selected date"
                      : dayFilter
                      ? "On " + dayFilter
                      : "Total"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
