"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Card } from "@/components/ui/card";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export default function EditSupplier() {
  const { id } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState<string | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  // Extract the ID from the URL
  useEffect(() => {
    if (id) {
      setSupplierId(Array.isArray(id) ? id[0] : id);
    } else {
      setError("Failed to load ingredient ID");
      setIsLoading(false);
      toast.error("Failed to load ingredient ID");
    }
  }, [id]);

  // Then use the extracted ID for fetching data
  useEffect(() => {
    const fetchSupplier = async () => {
      if (!supplierId) return;

      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/suppliers/${supplierId}`);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Failed to fetch supplier details"
          );
        }

        const supplier = await res.json();

        // Reset form with supplier data
        form.reset({
          name: supplier.name || "",
          contactPerson: supplier.contactPerson || "",
          email: supplier.email || "",
          phone: supplier.phone || "",
          address: supplier.address || "",
          notes: supplier.notes || "",
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching supplier:", error);
          setError(
            error.message ||
              "Failed to load supplier information. Please try again."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (supplierId) {
      fetchSupplier();
    }
  }, [supplierId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!supplierId) {
      setError("No supplier ID available");
      // Optionally add a toast here too if you want user feedback for this specific case
      // toast.error("Cannot save: Supplier ID is missing.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch(`/api/suppliers/${supplierId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Keep the existing error handling, but throw to catch block
        throw new Error(errorData.message || "Failed to update supplier");
      }

      // --- Add success toast ---
      toast.success("Supplier updated successfully!");

      // Redirect back to suppliers list on success
      router.push("/suppliers");
      // router.refresh(); // Keep or remove refresh based on whether you need it after push
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage =
          error.message ||
          "An error occurred while updating the supplier. Please try again.";
        console.error("Error updating supplier:", error);
        setError(errorMessage);
        // --- Add error toast ---
        toast.error(errorMessage);
      } else {
        // Handle non-Error objects if necessary
        const genericMessage = "An unknown error occurred.";
        setError(genericMessage);
        toast.error(genericMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Edit Supplier</h2>
          <Button variant="outline" asChild>
            <Link href="/suppliers">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to Suppliers
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center">Loading supplier details...</div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{error}</p>
            <Button
              variant="outline"
              onClick={() => router.push("/suppliers")}
              className="mt-4"
            >
              Return to Suppliers
            </Button>
          </div>
        ) : (
          <Card className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter supplier name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter contact person name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="supplier@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter supplier address"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes about this supplier"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add any additional information about this supplier that
                        might be useful.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/suppliers")}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        )}
      </div>
    </div>
  );
}
