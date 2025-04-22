"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2, ArrowLeft } from "lucide-react";

type Supplier = {
  id: number;
  name: string;
};

export default function AddIngredientForm() {
  const router = useRouter();
  const supabase = createClient();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true); // New state for tracking supplier loading
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
    expiryDate: null as Date | null,
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
      setLoadingSuppliers(true); // Set loading state to true before fetching
      try {
        const response = await fetch("/api/suppliers");
        if (!response.ok) throw new Error("Failed to fetch suppliers");
        const data = await response.json();
        setSuppliers(data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
        toast.error("Failed to load suppliers");
      } finally {
        setLoadingSuppliers(false); // Set loading state to false after fetching
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, expiryDate: date }));
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

      // Format the date properly if it exists
      const formattedData = {
        ...formData,
        supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
        currentStock: 0.0,
        minimumStock: parseFloat(formData.minimumStock),
        idealStock: parseFloat(formData.idealStock),
        cost: parseFloat(formData.cost),
        expiryDate: formData.expiryDate
          ? formData.expiryDate.toISOString()
          : null,
      };

      const response = await fetch("/api/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
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
        expiryDate: null,
      });

      // Redirect to ingredients list
      router.push("/ingredients");
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to add ingredient");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 w-full">
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Add New Ingredient</h1>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ingredient Details</CardTitle>
            <CardDescription>
              Enter the details for the new ingredient. Fields marked with * are
              required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter ingredient name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleSelectChange("category", value)
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dry Goods">Dry Goods</SelectItem>
                      <SelectItem value="Dairy">Dairy</SelectItem>
                      <SelectItem value="Spices">Spices</SelectItem>
                      <SelectItem value="Fruit">Fruit</SelectItem>
                      <SelectItem value="Nuts">Nuts</SelectItem>
                      <SelectItem value="Sweeteners">Sweeteners</SelectItem>
                      <SelectItem value="Flavorings">Flavorings</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">
                    Unit <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleSelectChange("unit", value)}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="l">Liters (l)</SelectItem>
                      <SelectItem value="ml">Milliliters (ml)</SelectItem>
                      <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      <SelectItem value="dozen">Dozen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">
                    Cost per Unit <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      $
                    </span>
                    <Input
                      id="cost"
                      name="cost"
                      type="number"
                      value={formData.cost}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="pl-8"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="currentStock">
                    Current Stock <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="currentStock"
                    name="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="minimumStock">Minimum Stock Level</Label>
                  <Input
                    id="minimumStock"
                    name="minimumStock"
                    type="number"
                    value={formData.minimumStock}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idealStock">Ideal Stock Level</Label>
                  <Input
                    id="idealStock"
                    name="idealStock"
                    type="number"
                    value={formData.idealStock}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  {loadingSuppliers ? (
                    <div className="flex items-center space-x-2 h-10 pl-3 border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      <span className="text-gray-500">
                        Loading suppliers...
                      </span>
                    </div>
                  ) : suppliers && suppliers.length > 0 ? (
                    <Select
                      value={formData.supplierId}
                      onValueChange={(value) =>
                        handleSelectChange("supplierId", value)
                      }
                    >
                      <SelectTrigger id="supplier">
                        <SelectValue placeholder="Select Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem
                            key={supplier.id}
                            value={supplier.id.toString()}
                          >
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <div className="text-gray-500 italic">
                        No suppliers available
                      </div>
                      <Button
                        type="button"
                        onClick={() => router.push("/suppliers/create")}
                        variant="outline"
                        size="sm"
                      >
                        Add Supplier
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Storage Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter storage location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">
                    Expiry Date (if applicable)
                  </Label>
                  <DatePicker
                    date={formData.expiryDate}
                    setDate={handleDateChange}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter a description for this ingredient"
                  rows={3}
                />
              </div>

              <div className="flex justify-end pt-4 space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !isFormValid()}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Ingredient"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
