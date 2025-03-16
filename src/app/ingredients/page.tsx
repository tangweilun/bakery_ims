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
  CheckCircle,
  Filter,
  Search,
  ArrowUpDown,
  ChevronDown,
  MoreVertical,
  Eye,
} from "lucide-react";

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
      try {
        const response = await fetch("/api/ingredients");
        if (!response.ok) throw new Error("Failed to fetch ingredients");
        const data = await response.json();
        setIngredients(data);
        setFilteredIngredients(data);
      } catch (err) {
        console.error("Error fetching ingredients:", err);
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
      return { status: "low", color: "text-red-600 bg-red-100" };
    } else if (ingredient.currentStock < ingredient.idealStock) {
      return { status: "normal", color: "text-yellow-600 bg-yellow-100" };
    } else {
      return { status: "ideal", color: "text-green-600 bg-green-100" };
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
        <div className="bg-white rounded-lg shadow-md border border-gray-100">
          {/* Page Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Manage Ingredients
              </h1>
              <p className="text-gray-600 mt-1">
                View, edit, and manage your ingredient inventory
              </p>
            </div>
            <Link
              href="/ingredients/add"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={18} /> Add New Ingredient
            </Link>
          </div>

          {/* Filters Section */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-1/3">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                {/* Category Filter */}
                <div className="w-full sm:w-auto">
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock Level Filter */}
                <div className="w-full sm:w-auto">
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                  >
                    <option value="">All Stock Levels</option>
                    <option value="low">Low Stock</option>
                    <option value="normal">Normal Stock</option>
                    <option value="ideal">Ideal Stock</option>
                  </select>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={clearFilters}
                  className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                  disabled={
                    !searchTerm &&
                    !categoryFilter &&
                    !stockFilter &&
                    sortField === "name" &&
                    sortDirection === "asc"
                  }
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Ingredients Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredIngredients.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mb-4 flex justify-center">
                  {searchTerm || categoryFilter || stockFilter ? (
                    <Filter size={48} className="text-gray-400" />
                  ) : (
                    <AlertTriangle size={48} className="text-yellow-500" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {searchTerm || categoryFilter || stockFilter
                    ? "No ingredients match your filters"
                    : "No ingredients found"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || categoryFilter || stockFilter
                    ? "Try adjusting your search or filter criteria"
                    : "Get started by adding your first ingredient"}
                </p>
                {searchTerm || categoryFilter || stockFilter ? (
                  <button
                    onClick={clearFilters}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <Link
                    href="/ingredients/add"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={18} /> Add Ingredient
                  </Link>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        {sortField === "name" && (
                          <ArrowUpDown
                            size={14}
                            className={`ml-1 ${
                              sortDirection === "desc"
                                ? "transform rotate-180"
                                : ""
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Category</span>
                        {sortField === "category" && (
                          <ArrowUpDown
                            size={14}
                            className={`ml-1 ${
                              sortDirection === "desc"
                                ? "transform rotate-180"
                                : ""
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span>Stock</span>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("currentStock")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Quantity</span>
                        {sortField === "currentStock" && (
                          <ArrowUpDown
                            size={14}
                            className={`ml-1 ${
                              sortDirection === "desc"
                                ? "transform rotate-180"
                                : ""
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("cost")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Cost</span>
                        {sortField === "cost" && (
                          <ArrowUpDown
                            size={14}
                            className={`ml-1 ${
                              sortDirection === "desc"
                                ? "transform rotate-180"
                                : ""
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("supplier")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Supplier</span>
                        {sortField === "supplier" && (
                          <ArrowUpDown
                            size={14}
                            className={`ml-1 ${
                              sortDirection === "desc"
                                ? "transform rotate-180"
                                : ""
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredIngredients.map((ingredient) => {
                    const stockStatus = getStockStatus(ingredient);
                    return (
                      <tr key={ingredient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {ingredient.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {ingredient.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}
                          >
                            {stockStatus.status === "low"
                              ? "Low Stock"
                              : stockStatus.status === "normal"
                              ? "Normal"
                              : "Ideal"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {ingredient.currentStock} {ingredient.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            Min: {ingredient.minimumStock} | Ideal:{" "}
                            {ingredient.idealStock}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${ingredient.cost.toFixed(2)}/{ingredient.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {ingredient.supplier?.name || "Not specified"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex justify-end">
                          <Link
                            href={`/ingredients/${ingredient.id}`}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            href={`/ingredients/edit/${ingredient.id}`}
                            className="text-indigo-500 hover:text-indigo-700 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </Link>
                          <button
                            onClick={() => confirmDelete(ingredient.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer / Pagination could go here */}
          {!isLoading && filteredIngredients.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-sm text-gray-600">
              Showing {filteredIngredients.length} of {ingredients.length}{" "}
              ingredients
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <AlertTriangle size={48} />
            </div>
            <h3 className="text-lg font-bold text-center mb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this ingredient? This action
              cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
