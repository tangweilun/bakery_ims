"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";

type Supplier = {
  id: number;
  name: string;
};

export default function AddIngredientForm() {
  const router = useRouter();
  const supabase = createClient();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    checkAuth();

    // Fetch suppliers for the dropdown
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/suppliers");
        if (!response.ok) throw new Error("Failed to fetch suppliers");
        const data = await response.json();
        setSuppliers(data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
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
    setError("");
    setSuccess("");

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

      const result = await response.json();
      setSuccess("Ingredient added successfully!");

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
    } catch (err: any) {
      setError(err.message || "Failed to add ingredient");
    } finally {
      setIsLoading(false);
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
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Add New Ingredient</h2>

        {error && (
          <div className="bg-red-100 p-4 mb-6 rounded text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 p-4 mb-6 rounded text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border rounded"
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

            <div>
              <label className="block mb-2">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full p-2 border rounded"
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

            <div>
              <label className="block mb-2">
                Cost per Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">
                Current Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Minimum Stock Level</label>
              <input
                type="number"
                name="minimumStock"
                value={formData.minimumStock}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2">Ideal Stock Level</label>
              <input
                type="number"
                name="idealStock"
                value={formData.idealStock}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2">Supplier</label>
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Storage Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-2">Expiry Date (if applicable)</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows={3}
            ></textarea>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Ingredient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
