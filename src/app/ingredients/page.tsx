"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { toast, ToastContainer } from "react-toastify";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
  Filter,
  Search,
  ArrowUpDown,
  Eye,
  X,
  Loader2,
} from "lucide-react";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Ingredient = {
  id: number;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  idealStock: number;
  cost: number;
  supplier?: {
    id: number;
    name: string;
  };
  location?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export default function ManageIngredients() {
  const router = useRouter();
  const supabase = createClient();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<number | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Unique categories from ingredients
  const categories = [...new Set(ingredients.map((ing) => ing.category))];

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/sign-in"); // Redirect to login if not authenticated
        }
      } catch (error) {
        console.log("Authentication error:", error);
        router.push("/sign-in");
      }
    };

    // Fetch ingredients
    const fetchIngredients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/ingredients");
        if (!response.ok) throw new Error("Failed to fetch ingredients");
        const data = await response.json();
        setIngredients(data);
        setFilteredIngredients(data);
      } catch (err: any) {
        console.error("Error fetching ingredients:", err);
        setError(err.message || "Failed to load ingredients");
        toast.error("Failed to load ingredients");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    fetchIngredients();
  }, [router, supabase]);

  // Filter and sort ingredients whenever filters change
  useEffect(() => {
    let result = [...ingredients];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (ing) =>
          ing.name.toLowerCase().includes(search) ||
          ing.description?.toLowerCase().includes(search) ||
          ing.supplier?.name.toLowerCase().includes(search)
      );
    }

    // Apply category filter
    if (categoryFilter) {
      result = result.filter((ing) => ing.category === categoryFilter);
    }

    // Apply stock level filter
    if (stockFilter) {
      switch (stockFilter) {
        case "low":
          result = result.filter((ing) => ing.currentStock < ing.minimumStock);
          break;
        case "normal":
          result = result.filter(
            (ing) =>
              ing.currentStock >= ing.minimumStock &&
              ing.currentStock < ing.idealStock
          );
          break;
        case "ideal":
          result = result.filter((ing) => ing.currentStock >= ing.idealStock);
          break;
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      // Handle different field types
      if (sortField === "name" || sortField === "category") {
        comparison = a[sortField].localeCompare(b[sortField]);
      } else if (sortField === "supplier") {
        const supplierA = a.supplier?.name || "";
        const supplierB = b.supplier?.name || "";
        comparison = supplierA.localeCompare(supplierB);
      } else {
        // Numeric fields
        comparison =
          (a[sortField as keyof Ingredient] as number) -
          (b[sortField as keyof Ingredient] as number);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    setFilteredIngredients(result);
  }, [
    ingredients,
    searchTerm,
    categoryFilter,
    stockFilter,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = async () => {
    if (!ingredientToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/ingredients/${ingredientToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete ingredient");
      }

      // Remove from state
      setIngredients(
        ingredients.filter((ing) => ing.id !== ingredientToDelete)
      );
      toast.success("Ingredient deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete ingredient");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setIngredientToDelete(null);
    }
  };

  const confirmDelete = (id: number) => {
    setIngredientToDelete(id);
    setShowDeleteModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setStockFilter("");
    setSortField("name");
    setSortDirection("asc");
  };

  // Get stock status for an ingredient
  const getStockStatus = (ingredient: Ingredient) => {
    if (ingredient.currentStock < ingredient.minimumStock) {
      return {
        status: "low",
        className: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
      };
    } else if (ingredient.currentStock < ingredient.idealStock) {
      return {
        status: "normal",
        className:
          "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200",
      };
    } else {
      return {
        status: "ideal",
        className:
          "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
      };
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <ToastContainer position="bottom-right" />

      {/* Header/Navigation */}
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
        <Card>
          {/* Page Header */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">
                Manage Ingredients
              </CardTitle>
              <CardDescription>
                View, edit, and manage your ingredient inventory
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/ingredients/add">
                <Plus className="mr-2 h-4 w-4" /> Add New Ingredient
              </Link>
            </Button>
          </CardHeader>

          {/* Filters Section */}
          <CardContent className="py-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-1/3">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  className="pl-10"
                  placeholder="Search ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                {/* Category Filter */}
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Stock Level Filter */}
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Stock Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Stock Levels</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="normal">Normal Stock</SelectItem>
                    <SelectItem value="ideal">Ideal Stock</SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear Filters Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                  disabled={
                    !searchTerm &&
                    !categoryFilter &&
                    !stockFilter &&
                    sortField === "name" &&
                    sortDirection === "asc"
                  }
                  title="Clear Filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">
                Loading ingredients...
              </p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <h3 className="mt-4 text-lg font-medium">Something went wrong</h3>
              <p className="mt-2 text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredIngredients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3">
                {searchTerm || categoryFilter || stockFilter ? (
                  <Filter className="h-10 w-10 text-muted-foreground" />
                ) : (
                  <AlertTriangle className="h-10 w-10 text-amber-500" />
                )}
              </div>
              <h3 className="mt-4 text-lg font-medium">
                {searchTerm || categoryFilter || stockFilter
                  ? "No ingredients match your filters"
                  : "No ingredients found"}
              </h3>
              <p className="mt-2 text-center text-muted-foreground max-w-md">
                {searchTerm || categoryFilter || stockFilter
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first ingredient"}
              </p>
              <div className="mt-6">
                {searchTerm || categoryFilter || stockFilter ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/ingredients/add">
                      <Plus className="mr-2 h-4 w-4" /> Add Ingredient
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Ingredients Table */}
          {!isLoading && !error && filteredIngredients.length > 0 && (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer w-[200px]"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        {sortField === "name" && (
                          <ArrowUpDown className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer w-[120px]"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Category</span>
                        {sortField === "category" && (
                          <ArrowUpDown className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Stock</TableHead>
                    <TableHead
                      className="cursor-pointer w-[140px]"
                      onClick={() => handleSort("currentStock")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Quantity</span>
                        {sortField === "currentStock" && (
                          <ArrowUpDown className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer w-[100px]"
                      onClick={() => handleSort("cost")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Cost</span>
                        {sortField === "cost" && (
                          <ArrowUpDown className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer w-[140px]"
                      onClick={() => handleSort("supplier")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Supplier</span>
                        {sortField === "supplier" && (
                          <ArrowUpDown className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right w-[120px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIngredients.map((ingredient) => {
                    const stockStatus = getStockStatus(ingredient);
                    return (
                      <TableRow key={ingredient.id}>
                        <TableCell className="font-medium">
                          {ingredient.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ingredient.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={stockStatus.className}
                            variant="outline"
                          >
                            {stockStatus.status === "low"
                              ? "Low Stock"
                              : stockStatus.status === "normal"
                              ? "Normal"
                              : "Ideal"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {ingredient.currentStock} {ingredient.unit}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Min: {ingredient.minimumStock} | Ideal:{" "}
                            {ingredient.idealStock}
                          </div>
                        </TableCell>
                        <TableCell>
                          ${ingredient.cost.toFixed(2)}/{ingredient.unit}
                        </TableCell>
                        <TableCell>
                          {ingredient.supplier?.name || "Not specified"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button size="icon" variant="ghost" asChild>
                              <Link
                                href={`/ingredients/${ingredient.id}`}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button size="icon" variant="ghost" asChild>
                              <Link
                                href={`/ingredients/${ingredient.id}/edit`}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => confirmDelete(ingredient.id)}
                              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Table Footer */}
          {!isLoading && !error && filteredIngredients.length > 0 && (
            <CardFooter className="flex justify-between border-t px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredIngredients.length} of {ingredients.length}{" "}
                ingredients
              </p>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ingredient? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center text-destructive my-4">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
