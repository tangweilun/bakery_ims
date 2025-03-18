"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { toast, ToastContainer } from "react-toastify";

type Supplier = {
  id: number;
  name: string;
};

export default function AddIngredientForm() {
  const router = useRouter();
  const supabase = createClient();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    unit: "",
    currentStock: "0",
    minimumStock: "0",
    idealStock: "0",
    cost: "0",
    supplierId: "",
    location: "",
    expiryDate: "",
  });

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.category.trim() !== "" &&
      formData.unit.trim() !== "" &&
      parseFloat(formData.cost) > 0 &&
      parseFloat(formData.currentStock) >= 0
    );
  };

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

    // Fetch suppliers for the dropdown
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/suppliers");
        if (!response.ok) throw new Error("Failed to fetch suppliers");
        const data = await response.json();
        setSuppliers(data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
        toast.error("Failed to load suppliers");
      }
    };

    checkAuth();
    fetchSuppliers();
  }, [router, supabase]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if user is still authenticated
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/");
        return;
      }

      const response = await fetch("/api/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          supplierId: formData.supplierId
            ? parseInt(formData.supplierId)
            : null,
          currentStock: parseFloat(formData.currentStock),
          minimumStock: parseFloat(formData.minimumStock),
          idealStock: parseFloat(formData.idealStock),
          cost: parseFloat(formData.cost),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add ingredient");
      }

      await response.json();
      toast.success("Ingredient added successfully!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        unit: "",
        currentStock: "0",
        minimumStock: "0",
        idealStock: "0",
        cost: "0",
        supplierId: "",
        location: "",
        expiryDate: "",
      });

      // Refresh data
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to add ingredient");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <ToastContainer position="bottom-right" />

      <div className="border-b bg-white shadow-sm">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
            Add New Ingredient
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Dry Goods">Dry Goods</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Spices">Spices</option>
                  <option value="Fruit">Fruit</option>
                  <option value="Nuts">Nuts</option>
                  <option value="Sweeteners">Sweeteners</option>
                  <option value="Flavorings">Flavorings</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                >
                  <option value="">Select Unit</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="l">Liters (l)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="dozen">Dozen</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                  Cost per Unit <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                  Current Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                  Minimum Stock Level
                </label>
                <input
                  type="number"
                  name="minimumStock"
                  value={formData.minimumStock}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                  Ideal Stock Level
                </label>
                <input
                  type="number"
                  name="idealStock"
                  value={formData.idealStock}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                  Supplier
                </label>
                {suppliers && suppliers.length > 0 ? (
                  <select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <div className="text-gray-500 italic">
                      No suppliers available
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/suppliers/add")}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      Add Supplier
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                  Storage Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-gray-700">
                  Expiry Date (if applicable)
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows={3}
              ></textarea>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className={`px-6 py-2 rounded-md text-white transition-all ${
                  isLoading || !isFormValid()
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? (
                  <span className="flex items-center">
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
                    Adding...
                  </span>
                ) : (
                  "Add Ingredient"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
