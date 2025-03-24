"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { toast } from "react-toastify";

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

type Supplier = {
  id: number;
  name: string;
};

export default function EditIngredientPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingredientId, setIngredientId] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const supabase = createClient();

  // Form state
  const [ingredient, setIngredient] = useState<{
    name: string;
    description: string;
    category: string;
    unit: string;
    minimumStock: number;
    idealStock: number;
    cost: number;
    supplierId: number | null;
  }>({
    name: "",
    description: "",
    category: "",
    unit: "",
    minimumStock: 0,
    idealStock: 0,
    cost: 0,
    supplierId: null,
  });

  // First, extract the ID from params asynchronously
  useEffect(() => {
    // No need to await params, it's already available as an object
    if (params && params.id) {
      setIngredientId(params.id);
    } else {
      setError("Failed to load ingredient ID");
      setLoading(false);
      toast.error("Failed to load ingredient ID");
    }
  }, [params]);

  // Fetch ingredient data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          toast.error("You must be logged in to edit ingredients");
          router.push("/sign-in"); // Redirect to login if not authenticated
        }
      } catch (error) {
        console.log("Authentication error:", error);
        toast.error("Authentication error, please sign in again");
        router.push("/sign-in");
      }
    };

    const fetchIngredient = async () => {
      if (!ingredientId) return;

      try {
        const response = await fetch(`/api/ingredients/${ingredientId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch ingredient");
        }

        const data = await response.json();
        setIngredient({
          name: data.name,
          description: data.description || "",
          category: data.category,
          unit: data.unit,
          minimumStock: data.minimumStock,
          idealStock: data.idealStock,
          cost: data.cost,
          supplierId: data.supplierId,
        });

        // Fetch suppliers
        const suppliersResponse = await fetch("/api/suppliers");
        if (suppliersResponse.ok) {
          const suppliersData = await suppliersResponse.json();
          setSuppliers(suppliersData);
        } else {
          toast.warning("Could not load suppliers");
        }

        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
          setLoading(false);
          toast.error(`Error: ${err.message}`);
        }
      }
    };

    checkAuth();
    if (ingredientId) {
      fetchIngredient();
    }
  }, [ingredientId, router, supabase.auth]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setIngredient((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  // Handle select changes for category, unit, and supplier
  const handleSelectChange = (value: string, field: string) => {
    setIngredient((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle supplier select
  const handleSupplierChange = (value: string) => {
    setIngredient((prev) => ({
      ...prev,
      supplierId: value === "none" ? null : parseInt(value),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;

      const response = await fetch(`/api/ingredients/${ingredientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...ingredient,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update ingredient");
      }

      toast.success("Ingredient updated successfully");

      // Redirect to manage ingredient page
      router.push(`/ingredients`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        setSaving(false);
        toast.error(`Error: ${err.message}`);
      }
    }
  };

  // Main layout that's consistent across all states
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

      <div className="flex-1 p-6 container mx-auto max-w-4xl">
        {/* Loading State */}
        {loading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <div className="flex space-x-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">
                {error && !ingredient.name
                  ? "Error Loading Ingredient"
                  : `Edit Ingredient: ${ingredient.name}`}
              </h1>
              <Button variant="outline" asChild>
                <Link
                  href={
                    error && !ingredient.name
                      ? "/ingredients"
                      : `/ingredients/${ingredientId}/edit`
                  }
                >
                  {error && !ingredient.name ? "Back to Ingredients" : "Cancel"}
                </Link>
              </Button>
            </div>

            {/* Error State */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            {!error || ingredient.name ? (
              <Card>
                <CardHeader>
                  <CardTitle>Ingredient Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={ingredient.name}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-2">
                        <Label htmlFor="category">
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={ingredient?.category || "none"}
                          onValueChange={(value) =>
                            handleSelectChange(value, "category")
                          }
                          required
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              Select Category
                            </SelectItem>
                            <SelectItem value="Dry Goods">Dry Goods</SelectItem>
                            <SelectItem value="Dairy">Dairy</SelectItem>
                            <SelectItem value="Spices">Spices</SelectItem>
                            <SelectItem value="Flours">Flours</SelectItem>
                            <SelectItem value="Sweeteners">
                              Sweeteners
                            </SelectItem>
                            <SelectItem value="Nuts">Nuts</SelectItem>
                            <SelectItem value="Fats">Fats</SelectItem>
                            <SelectItem value="Fruits">Fruits</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Unit */}
                      <div className="space-y-2">
                        <Label htmlFor="unit">
                          Unit <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={ingredient.unit || "none"}
                          onValueChange={(value) =>
                            handleSelectChange(value, "unit")
                          }
                          required
                        >
                          <SelectTrigger id="unit">
                            <SelectValue placeholder="Select Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select Unit</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="l">l</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="pcs">pcs</SelectItem>
                            <SelectItem value="doz">doz</SelectItem>
                            <SelectItem value="tbsp">tbsp</SelectItem>
                            <SelectItem value="tsp">tsp</SelectItem>
                            <SelectItem value="cup">cup</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Cost */}
                      <div className="space-y-2">
                        <Label htmlFor="cost">
                          Cost per Unit <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">$</span>
                          </div>
                          <Input
                            id="cost"
                            name="cost"
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={ingredient.cost || "none"}
                            onChange={handleChange}
                            className="pl-7"
                          />
                        </div>
                      </div>

                      {/* Minimum Stock */}
                      <div className="space-y-2">
                        <Label htmlFor="minimumStock">
                          Minimum Stock <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="minimumStock"
                          name="minimumStock"
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={ingredient.minimumStock || "none"}
                          onChange={handleChange}
                        />
                        <p className="text-sm text-gray-500">
                          Low stock alert will be triggered below this level
                        </p>
                      </div>

                      {/* Ideal Stock */}
                      <div className="space-y-2">
                        <Label htmlFor="idealStock">
                          Ideal Stock <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="idealStock"
                          name="idealStock"
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={ingredient.idealStock || "none"}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Supplier */}
                      <div className="space-y-2">
                        <Label htmlFor="supplierId">Supplier</Label>
                        <Select
                          value={ingredient.supplierId?.toString() || "none"}
                          onValueChange={handleSupplierChange}
                        >
                          <SelectTrigger id="supplierId">
                            <SelectValue placeholder="No Supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Supplier</SelectItem>
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
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={ingredient.description || "none"}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex space-x-4 pt-4">
                      <Button type="submit" disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                      {/* <Button variant="outline" asChild>
                        <Link href={`/ingredients`}>Cancel</Link>
                      </Button> */}
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
