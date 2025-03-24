"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Search, AlertTriangle, Trash2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Batch, BatchUsageData } from "@/types/batch";
import { Ingredient } from "@/types/ingredient";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { toast } from "react-toastify";

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewBatchUsageOpen, setIsViewBatchUsageOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [batchUsageData, setBatchUsageData] = useState<BatchUsageData | null>(
    null
  );
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [filter, setFilter] = useState({
    ingredient: "none",
    expiryStatus: "all", // all, expired, expiringSoon, active
    search: "",
  });

  // Form state for adding new batch
  const [newBatch, setNewBatch] = useState({
    batchNumber: "",
    ingredientId: 0,
    ingredientName: "",
    quantity: 0,
    cost: 0,
    expiryDate: null as Date | null,
    location: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch batches
        const batchesResponse = await fetch("/api/batches");
        const batchesData = await batchesResponse.json();
        setBatches(batchesData);

        // Fetch ingredients for the dropdown
        const ingredientsResponse = await fetch("/api/ingredients");
        const ingredientsData = await ingredientsResponse.json();
        setIngredients(ingredientsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateBatchNumber = () => {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const randomPart = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
    return `${datePart}-${randomPart}`;
  };

  const handleAddBatch = async () => {
    const batchNumber = generateBatchNumber(); // Auto-generate batch number
    try {
      const response = await fetch("/api/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newBatch, batchNumber }),
      });

      if (!response.ok) {
        throw new Error("Failed to add batch");
      }

      const addedBatch = await response.json();
      setBatches([...batches, addedBatch]);
      toast.success("Batch added successfully!");
      setIsAddDialogOpen(false);

      // Reset form
      setNewBatch({
        batchNumber: "",
        ingredientId: 0,
        ingredientName: "",
        quantity: 0,
        cost: 0,
        expiryDate: null,
        location: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error adding batch:", error);
      toast.error("Error adding batch");
    }
  };

  // Show delete confirmation dialog
  const confirmDeleteBatch = (batch: Batch) => {
    setBatchToDelete(batch);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteBatch = async () => {
    if (!batchToDelete) return;

    try {
      const response = await fetch(`/api/batches/${batchToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete batch");
      }

      // Remove the batch from the state
      setBatches(batches.filter((b) => b.id !== batchToDelete.id));
      toast.success(`Batch ${batchToDelete.batchNumber} deleted successfully!`);

      // Close dialog and reset state
      setIsDeleteDialogOpen(false);
      setBatchToDelete(null);
    } catch (error) {
      console.error("Error deleting batch:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(errorMessage);
    }
  };

  const formatQuantity = (value: number) => {
    // Check if the number is an integer
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  };

  const handleViewBatchUsage = async (batch: Batch) => {
    setCurrentBatch(batch);
    setIsViewBatchUsageOpen(true);
    setIsLoadingUsage(true);

    try {
      const response = await fetch(`/api/batches/${batch.id}/usage`);
      if (!response.ok) {
        throw new Error("Failed to fetch batch usage data");
      }

      const data = await response.json();
      setBatchUsageData(data);
    } catch (error) {
      console.error("Error fetching batch usage:", error);
      toast.error("Error fetching batch usage data");
    } finally {
      setIsLoadingUsage(false);
    }
  };

  const getExpiryStatus = (expiryDate: Date | null) => {
    if (!expiryDate) return "No Expiry";

    const today = new Date();
    const expiryDay = new Date(expiryDate);

    if (expiryDay < today) {
      return "Expired";
    }

    // Check if expiring in next 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    if (expiryDay < sevenDaysFromNow) {
      return "Expiring Soon";
    }

    return "Active";
  };

  const getExpiryBadgeColor = (status: string) => {
    switch (status) {
      case "Expired":
        return "bg-red-500";
      case "Expiring Soon":
        return "bg-amber-500";
      case "Active":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredBatches = batches.filter((batch) => {
    // Filter by ingredient
    if (
      filter.ingredient !== "none" &&
      batch.ingredientId.toString() !== filter.ingredient
    ) {
      return false;
    }

    // Filter by expiry status
    if (filter.expiryStatus !== "all") {
      const status = getExpiryStatus(batch.expiryDate)
        .toLowerCase()
        .replace(" ", "");
      if (filter.expiryStatus !== status) {
        return false;
      }
    }

    // Filter by search term (batch number, location, or notes)
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      return (
        batch.batchNumber.toLowerCase().includes(searchTerm) ||
        (batch.location && batch.location.toLowerCase().includes(searchTerm)) ||
        (batch.notes && batch.notes.toLowerCase().includes(searchTerm)) ||
        batch.ingredient.name.toLowerCase().includes(searchTerm)
      );
    }

    return true;
  });

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
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Batch Management</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add New Batch
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Batch Filters</CardTitle>
            <CardDescription>
              Filter batches by ingredient, expiry status, or search term
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ingredient-filter">Ingredient</Label>
                <Select
                  value={filter.ingredient}
                  onValueChange={(value) =>
                    setFilter({ ...filter, ingredient: value })
                  }
                >
                  <SelectTrigger id="ingredient-filter">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SelectValue placeholder="All Ingredients" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Ingredients</SelectItem>
                    {ingredients.map((ingredient) => (
                      <SelectItem
                        key={ingredient.id}
                        value={ingredient.id.toString()}
                      >
                        {ingredient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expiry-filter">Expiry Status</Label>
                <Select
                  value={filter.expiryStatus}
                  onValueChange={(value) =>
                    setFilter({ ...filter, expiryStatus: value })
                  }
                >
                  <SelectTrigger id="expiry-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="expiringsoon">Expiring Soon</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="noexpiry">No Expiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="search">Search</Label>
                <div className="flex">
                  <Input
                    id="search"
                    placeholder="Search batch number, location, etc."
                    value={filter.search}
                    onChange={(e) =>
                      setFilter({ ...filter, search: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Button variant="outline" className="ml-2">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Batch Inventory</CardTitle>
              <CardDescription>
                {filteredBatches.length} batches found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch #</TableHead>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Received Date</TableHead>
                    <TableHead>Expiry Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No batches found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBatches.map((batch) => {
                      const expiryStatus = getExpiryStatus(batch.expiryDate);
                      const badgeColor = getExpiryBadgeColor(expiryStatus);

                      return (
                        <TableRow key={batch.id}>
                          <TableCell className="font-medium">
                            {batch.batchNumber}
                          </TableCell>
                          <TableCell>{batch.ingredient.name}</TableCell>
                          <TableCell>
                            {batch.quantity} {batch.ingredient.unit}
                          </TableCell>
                          <TableCell>
                            {batch.remainingQuantity} {batch.ingredient.unit}
                          </TableCell>
                          <TableCell>{batch.location || "N/A"}</TableCell>
                          <TableCell>
                            {new Date(batch.receivedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={badgeColor}>{expiryStatus}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewBatchUsage(batch)}
                              >
                                View Usage
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => confirmDeleteBatch(batch)}
                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Add New Batch Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Batch</DialogTitle>
              <DialogDescription>
                Enter the details for the new ingredient batch.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="ingredient">Ingredient</Label>
                  <Select
                    value={newBatch.ingredientId.toString()}
                    onValueChange={(value) => {
                      const selectedIngredient = ingredients.find(
                        (ingredient) => ingredient.id.toString() === value
                      );

                      setNewBatch({
                        ...newBatch,
                        ingredientId: parseInt(value),
                        ingredientName: selectedIngredient
                          ? selectedIngredient.name
                          : "", // Ensure name is set
                      });
                    }}
                  >
                    <SelectTrigger id="ingredient">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <SelectValue placeholder="Select ingredient" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {ingredients.length === 0 ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : (
                        ingredients.map((ingredient) => (
                          <SelectItem
                            key={ingredient.id}
                            value={ingredient.id.toString()}
                          >
                            {ingredient.name} ({ingredient.unit})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newBatch.quantity || ""}
                    onChange={(e) =>
                      setNewBatch({
                        ...newBatch,
                        quantity: parseFloat(e.target.value),
                      })
                    }
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={newBatch.cost || ""}
                    onChange={(e) =>
                      setNewBatch({
                        ...newBatch,
                        cost: parseFloat(e.target.value),
                      })
                    }
                    placeholder="Enter cost"
                  />
                </div>

                <div>
                  <Label htmlFor="expiry-date">Expiry Date</Label>
                  <DatePicker
                    date={newBatch.expiryDate}
                    setDate={(date) =>
                      setNewBatch({ ...newBatch, expiryDate: date })
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Storage Location</Label>
                  <Input
                    id="location"
                    value={newBatch.location || ""}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, location: e.target.value })
                    }
                    placeholder="Enter storage location"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newBatch.notes || ""}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, notes: e.target.value })
                    }
                    placeholder="Enter any additional notes"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddBatch}>Add Batch</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete batch{" "}
                <span className="font-semibold">
                  {batchToDelete?.batchNumber}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {batchToDelete?.ingredient.name}
                </span>
                ?
              </AlertDialogDescription>
              {/* Moved the warning div outside of AlertDialogDescription */}
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                This action cannot be undone. This will permanently delete the
                batch. The delete action only can be done when there is no
                associated usage record.
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteBatch}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete Batch
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Batch Usage Dialog */}
        <Dialog
          open={isViewBatchUsageOpen}
          onOpenChange={setIsViewBatchUsageOpen}
        >
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Batch Usage History</DialogTitle>
              <DialogDescription>
                Viewing usage history for batch {currentBatch?.batchNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {/* Batch details summary */}
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Ingredient
                    </p>
                    <p>{currentBatch?.ingredient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Initial Quantity
                    </p>
                    <p>
                      {currentBatch
                        ? formatQuantity(currentBatch.quantity)
                        : ""}{" "}
                      {currentBatch?.ingredient.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Remaining
                    </p>
                    <p>
                      {currentBatch
                        ? formatQuantity(currentBatch.remainingQuantity)
                        : ""}{" "}
                      {currentBatch?.ingredient.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Usage</p>
                    <p>
                      {currentBatch
                        ? formatQuantity(
                            (currentBatch.quantity || 0) -
                              (currentBatch.remainingQuantity || 0)
                          )
                        : ""}{" "}
                      {currentBatch?.ingredient.unit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage records table */}
              {isLoadingUsage ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : batchUsageData?.batchUsages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No usage records found for this batch.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">
                          Date
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Quantity Used
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Purpose
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Production
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          User
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Notes
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batchUsageData?.batchUsages.map((usage) => (
                        <TableRow key={usage.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(usage.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatQuantity(usage.quantityUsed)}{" "}
                            {currentBatch?.ingredient.unit}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {usage.usageRecord.reason}
                          </TableCell>
                          <TableCell>
                            {usage.usageRecord.productionRecord ? (
                              <>
                                <span className="font-medium">
                                  {
                                    usage.usageRecord.productionRecord.recipe
                                      .name
                                  }
                                </span>
                                <span className="text-gray-500 text-sm block">
                                  Qty:{" "}
                                  {usage.usageRecord.productionRecord.quantity}
                                </span>
                              </>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>
                            {usage.usageRecord.user.name ||
                              usage.usageRecord.user.email}
                          </TableCell>
                          <TableCell>
                            {usage.usageRecord.notes || "No notes"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Usage summary - only show if there are usage records */}
              {batchUsageData &&
                batchUsageData.batchUsages &&
                batchUsageData.batchUsages.length > 0 && (
                  <div className="mt-4 p-4 border rounded-md bg-gray-50">
                    <h4 className="font-medium mb-2">Usage Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Total Usage Records
                        </p>
                        <p className="font-medium">
                          {batchUsageData?.batchUsages.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Total Quantity Used
                        </p>
                        <p className="font-medium">
                          {formatQuantity(
                            batchUsageData?.batchUsages.reduce(
                              (sum, usage) => sum + usage.quantityUsed,
                              0
                            ) || 0
                          )}{" "}
                          {currentBatch?.ingredient.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            <DialogFooter>
              <Button onClick={() => setIsViewBatchUsageOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
