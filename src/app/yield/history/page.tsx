"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CalendarIcon,
  ArrowUpDown,
  RefreshCw,
  FileDown,
  ArrowLeft,
} from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { MainNav } from "@/components/main-nav";
import { useSearchParams } from "next/navigation";

type ProductionRecord = {
  id: number;
  recipeId: number;
  recipeName: string;
  quantity: number;
  batchNumbers: string[] | [];
  notes: string | null;
  createdAt: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  ingredients: {
    id: number;
    name: string;
    quantity: number;
    unit: string;
  }[];
  wastage: {
    id: number;
    name: string;
    quantity: number;
    unit: string;
  }[];
};

type Recipe = {
  id: number;
  name: string;
};

const DEFAULT_PAGE_SIZE = 10;

// Main wrapper component that uses Suspense
export default function YieldHistoryPage() {
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
        <Suspense
          fallback={
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          }
        >
          <YieldHistoryContent />
        </Suspense>
      </div>
    </div>
  );
}

// Content component that uses useSearchParams
function YieldHistoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    pages: 1,
  });

  // Filter states
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [batchNumber, setBatchNumber] = useState<string>("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch records when params change
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);

        // Get parameters from URL or state
        const page = searchParams.get("page") || pagination.page.toString();
        const recipeId = searchParams.get("recipeId") || selectedRecipe;
        const start =
          searchParams.get("startDate") ||
          (startDate ? format(startDate, "yyyy-MM-dd") : "");
        const end =
          searchParams.get("endDate") ||
          (endDate ? format(endDate, "yyyy-MM-dd") : "");
        const batch = searchParams.get("batchNumber") || batchNumber;
        const sort = searchParams.get("sortBy") || sortBy;
        const order = searchParams.get("sortOrder") || sortOrder;

        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.set("page", page);
        queryParams.set("limit", pagination.limit.toString());
        if (recipeId) queryParams.set("recipeId", recipeId);
        if (start) queryParams.set("startDate", start);
        if (end) queryParams.set("endDate", end);
        if (batch) queryParams.set("batchNumber", batch);
        queryParams.set("sortBy", sort);
        queryParams.set("sortOrder", order);

        // Fetch data
        const response = await fetch(`/api/yield?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch production records");
        }

        const data = await response.json();
        setRecords(data.records);
        setPagination(data.pagination);

        // Update state with URL params
        setSelectedRecipe(recipeId);
        setSortBy(sort);
        setSortOrder(order);
        if (searchParams.get("startDate")) {
          setStartDate(start ? new Date(start) : null);
        }
        if (searchParams.get("endDate")) {
          setEndDate(end ? new Date(end) : null);
        }
        if (searchParams.get("batchNumber")) {
          setBatchNumber(batch);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [
    searchParams,
    pagination.page,
    pagination.limit,
    selectedRecipe,
    startDate,
    endDate,
    batchNumber,
    sortBy,
    sortOrder,
  ]);

  // Fetch recipes for filter dropdown
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch("/api/recipes");
        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }
        const data = await response.json();
        setRecipes(data || []);
      } catch (err) {
        console.error("Error fetching recipes:", err);
      }
    };

    fetchRecipes();
  }, []);

  // Reset filters
  const resetFilters = () => {
    setSelectedRecipe(null);
    setStartDate(null);
    setEndDate(null);
    setBatchNumber("");
    setSortBy("createdAt");
    setSortOrder("desc");
    router.push("/yield/history?page=1&sortBy=createdAt&sortOrder=desc");
  };

  // Toggle sort
  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", column);
    params.set(
      "sortOrder",
      sortBy === column && sortOrder === "asc" ? "desc" : "asc"
    );
    router.push(`?${params.toString()}`);
  };

  // Navigate to page
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  // Export data as CSV
  const exportCSV = () => {
    const headers = [
      "ID",
      "Recipe",
      "Quantity",
      "Batch Numbers",
      "Created Date",
      "Created By",
      "Notes",
    ];

    const csvData = records.map((record) => [
      record.id,
      record.recipeName,
      record.quantity,
      Array.isArray(record.batchNumbers)
        ? record.batchNumbers.join(", ")
        : record.batchNumbers,
      format(new Date(record.createdAt), "yyyy-MM-dd HH:mm"),
      record.userName || record.userEmail,
      record.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        row
          .map((cell) =>
            typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `yield-history-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/yield")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Yield Management
          </Button>
        </div>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Production History</CardTitle>
          <CardDescription>
            View and filter your bakery production records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="recipe">Recipe</Label>
              <Select
                value={selectedRecipe || "none"}
                onValueChange={setSelectedRecipe}
              >
                <SelectTrigger id="recipe">
                  <SelectValue placeholder="All recipes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All recipes</SelectItem>
                  {recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id.toString()}>
                      {recipe.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                placeholder="Enter batch number"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="startDate"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate || undefined}
                    onSelect={(date: Date | undefined) =>
                      setStartDate(date || null)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="endDate"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick an end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate || undefined}
                    onSelect={(date: Date | undefined) =>
                      setEndDate(date || null)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={resetFilters}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <div className="space-x-2">
              <Button onClick={exportCSV} variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <Card className="bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => toggleSort("id")}>
                        ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Recipe</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("quantity")}
                      >
                        Quantity
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => toggleSort("createdAt")}
                      >
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No production records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          #{record.id}
                        </TableCell>
                        <TableCell>{record.recipeName}</TableCell>
                        <TableCell>{record.quantity}</TableCell>
                        <TableCell>
                          {Array.isArray(record.batchNumbers) ? (
                            record.batchNumbers.length > 0 ? (
                              <div className="max-h-20 overflow-y-auto">
                                {record.batchNumbers.map(
                                  (batchNumber, index) => (
                                    <div key={index} className="text-sm mb-1">
                                      {batchNumber}
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                No batch numbers
                              </span>
                            )
                          ) : (
                            record.batchNumbers
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(record.createdAt), "MMM d, yyyy")}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(record.createdAt), "h:mm a")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                {record.userEmail || "User"}
                              </TooltipTrigger>
                              <TooltipContent>
                                {record.userEmail}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            <AccordionItem value={`item-${record.id}`}>
                              <AccordionTrigger className="py-2">
                                View Details
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4">
                                  {record.notes && (
                                    <div className="p-2 bg-slate-50 rounded-sm">
                                      <p className="text-sm font-medium">
                                        Notes:
                                      </p>
                                      <p className="text-sm">{record.notes}</p>
                                    </div>
                                  )}

                                  <div>
                                    <p className="text-sm font-medium mb-2">
                                      Ingredients Used:
                                    </p>
                                    <ul className="space-y-1">
                                      {record.ingredients.map((ingredient) => (
                                        <li
                                          key={ingredient.id}
                                          className="text-sm"
                                        >
                                          {ingredient.name}:{" "}
                                          {ingredient.quantity}{" "}
                                          {ingredient.unit}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {record.wastage.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Wastage:
                                      </p>
                                      <ul className="space-y-1">
                                        {record.wastage.map((item) => (
                                          <li key={item.id} className="text-sm">
                                            {item.name}: {item.quantity}{" "}
                                            {item.unit}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      (
                        e as React.MouseEvent<HTMLAnchorElement>
                      ).preventDefault();
                      if (pagination.page > 1) {
                        goToPage(pagination.page - 1);
                      }
                    }}
                    className={
                      pagination.page <= 1
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: pagination.pages }).map((_, i) => {
                  const pageNumber = i + 1;

                  // Only show a limited number of page links
                  if (
                    pageNumber === 1 ||
                    pageNumber === pagination.pages ||
                    (pageNumber >= pagination.page - 1 &&
                      pageNumber <= pagination.page + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.preventDefault();
                            goToPage(pageNumber);
                          }}
                          isActive={pageNumber === pagination.page}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  // Show ellipsis for skipped pages
                  if (
                    (pageNumber === 2 && pagination.page > 3) ||
                    (pageNumber === pagination.pages - 1 &&
                      pagination.page < pagination.pages - 2)
                  ) {
                    return (
                      <PaginationItem key={`ellipsis-${pageNumber}`}>
                        <span className="px-4">...</span>
                      </PaginationItem>
                    );
                  }

                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      if (pagination.page < pagination.pages) {
                        goToPage(pagination.page + 1);
                      }
                    }}
                    className={
                      pagination.page >= pagination.pages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </>
  );
}
