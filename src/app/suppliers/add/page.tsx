"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ArrowLeft, InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

interface SupplierFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export default function AddSupplier() {
  const [formData, setFormData] = useState<SupplierFormData>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Supplier name is required");
      return;
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Supplier added successfully");
        router.push("/suppliers");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to add supplier");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header - Responsive navigation */}
      <div className="border-b">
        <div className="flex h-16 items-center px-2 sm:px-4">
          <MainNav className="mx-2 sm:mx-6" />
          <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
            <UserNav />
          </div>
        </div>
      </div>

      {/* Main content - Responsive container */}
      <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-full sm:max-w-3xl mx-auto w-full">
        {/* Responsive header with back button */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-2">
          <Link
            href="/suppliers"
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2 sm:mb-0 sm:mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Back to suppliers</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold">Add Supplier</h2>
        </div>

        {/* Error alert */}
        {error && (
          <Alert variant="destructive" className="mb-4 sm:mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Responsive card */}
        <Card className="w-full">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">
              Supplier Information
            </CardTitle>
            <CardDescription className="text-sm">
              Add a new supplier to your inventory management system.
              <span className="flex items-center gap-1 mt-1">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <span>
                  Only Supplier Name is required. All other fields are optional.
                </span>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form
              onSubmit={handleSubmit}
              id="supplierForm"
              className="space-y-4 sm:space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter supplier name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contactPerson"
                    className="text-sm font-medium"
                  >
                    Contact Person{" "}
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    placeholder="Primary contact name"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address{" "}
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number{" "}
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Address{" "}
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Full address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full resize-none sm:resize-vertical"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <label htmlFor="notes" className="text-sm font-medium">
                    Notes{" "}
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Additional notes about this supplier"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full resize-none sm:resize-vertical"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 p-4 sm:p-6">
            <Button
              variant="outline"
              onClick={() => router.push("/suppliers")}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="supplierForm"
              disabled={loading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {loading ? "Adding..." : "Add Supplier"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
