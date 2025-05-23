"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  PlusCircle,
  Eye,
  Pencil,
  Trash,
  Mail,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Supplier } from "@/types/supplier";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function ManageSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [supplierToDelete, setSupplierToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/suppliers", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch suppliers");
        const data: Supplier[] = await res.json();
        setSuppliers(data);
      } catch (error) {
        console.error("Error loading suppliers:", error);
        toast.error("Failed to load suppliers.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const confirmDelete = (id: number) => {
    setSupplierToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;

    try {
      const res = await fetch(`/api/suppliers/${supplierToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete supplier");
      setSuppliers((prev) =>
        prev.filter((supplier) => supplier.id !== supplierToDelete)
      );
      toast.success("Supplier deleted successfully!");
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier. Please try again.");
    }
  };

  const viewSupplierDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      <div className="container mx-auto py-8 px-4">
        {/* Page Title & Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <Button asChild>
            <Link href="/suppliers/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Supplier
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="relative flex-grow pl-4">
              <Input
                placeholder="Search suppliers..."
                className="max-w-sm ml-auto block"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading suppliers...</div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No suppliers found.</p>
                <Button asChild>
                  <Link href="/suppliers/create">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add Your First
                    Supplier
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers
                      .filter(
                        (supplier) =>
                          supplier.name
                            .toLowerCase()
                            .includes(search.toLowerCase()) ||
                          (supplier.contactPerson &&
                            supplier.contactPerson
                              .toLowerCase()
                              .includes(search.toLowerCase())) ||
                          (supplier.email &&
                            supplier.email
                              .toLowerCase()
                              .includes(search.toLowerCase()))
                      )
                      .map((supplier) => (
                        <TableRow key={supplier.id}>
                          <TableCell>{supplier.id}</TableCell>
                          <TableCell className="font-medium">
                            {supplier.name}
                          </TableCell>
                          <TableCell>{supplier.contactPerson || "—"}</TableCell>
                          <TableCell>{supplier.email || "—"}</TableCell>
                          <TableCell>{supplier.phone || "—"}</TableCell>
                          <TableCell>
                            {formatDate(supplier.updatedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => viewSupplierDetails(supplier)}
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/suppliers/${supplier.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => confirmDelete(supplier.id)}
                                  className="text-red-600"
                                >
                                  <Trash className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!isLoading && suppliers.length > 0 && (
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  {
                    suppliers.filter(
                      (supplier) =>
                        supplier.name
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                        (supplier.contactPerson &&
                          supplier.contactPerson
                            .toLowerCase()
                            .includes(search.toLowerCase())) ||
                        (supplier.email &&
                          supplier.email
                            .toLowerCase()
                            .includes(search.toLowerCase()))
                    ).length
                  }{" "}
                  of {suppliers.length} suppliers
                </p>
              </CardFooter>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Supplier Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
            <DialogDescription>
              Complete information about the supplier
            </DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-6">
              <div className="border rounded-md p-6">
                <h3 className="text-lg font-medium">{selectedSupplier.name}</h3>
                <p className="text-sm text-gray-500">
                  Supplier ID: {selectedSupplier.id}
                </p>

                <div className="grid gap-y-4 mt-6">
                  <div className="flex">
                    <div className="w-1/3 font-medium">Contact Person:</div>
                    <div className="w-2/3">
                      {selectedSupplier.contactPerson || "—"}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-1/3 font-medium flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" /> Email:
                    </div>
                    <div className="w-2/3">{selectedSupplier.email || "—"}</div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-1/3 font-medium flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" /> Phone:
                    </div>
                    <div className="w-2/3">{selectedSupplier.phone || "—"}</div>
                  </div>

                  <div className="flex">
                    <div className="w-2/3 overflow-hidden break-all whitespace-pre-wrap">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" /> Address:
                    </div>
                    <div className="w-2/3 overflow-hidden break-all whitespace-pre-wrap">
                      {selectedSupplier.address || "—"}
                    </div>
                  </div>

                  <div className="flex">
                    <div className="w-1/3 font-medium flex items-start mt-1">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" /> Notes:
                    </div>
                    <div className="w-2/3">{selectedSupplier.notes || "—"}</div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between text-sm text-gray-500 mt-4">
                  <div>Created: {formatDate(selectedSupplier.createdAt)}</div>
                  <div>
                    Last Updated: {formatDate(selectedSupplier.updatedAt)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button asChild variant="default" className="gap-2">
                  <Link href={`/suppliers/${selectedSupplier.id}/edit`}>
                    <Pencil className="h-4 w-4" /> Edit Supplier
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              supplier and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
