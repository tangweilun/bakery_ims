import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Search } from "@/components/search"
import Link from "next/link"
import { PlusCircle, Filter, ArrowUpDown, ShoppingCart, Plus, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export const metadata: Metadata = {
  title: "Inventory Management",
  description: "Manage your bakery ingredients inventory",
}

// Mock data for demonstration
const ingredientsData = [
  {
    id: "1",
    name: "All-Purpose Flour",
    category: "Dry Goods",
    quantity: 75,
    unit: "kg",
    expirationDate: "2024-12-15",
    batchLot: "LOT-F12345",
    status: "In Stock",
  },
  {
    id: "2",
    name: "Granulated Sugar",
    category: "Dry Goods",
    quantity: 45,
    unit: "kg",
    expirationDate: "2024-11-30",
    batchLot: "LOT-S67890",
    status: "In Stock",
  },
  {
    id: "3",
    name: "Butter",
    category: "Dairy",
    quantity: 5,
    unit: "kg",
    expirationDate: "2023-06-15",
    batchLot: "LOT-B24680",
    status: "Low Stock",
  },
  {
    id: "4",
    name: "Eggs",
    category: "Dairy",
    quantity: 120,
    unit: "pcs",
    expirationDate: "2023-06-05",
    batchLot: "LOT-E13579",
    status: "Low Stock",
  },
  {
    id: "5",
    name: "Milk",
    category: "Dairy",
    quantity: 8,
    unit: "L",
    expirationDate: "2023-06-02",
    batchLot: "LOT-M97531",
    status: "Expiring Soon",
  },
]

export default function InventoryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <Search />
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Ingredient
                  <svg
                    className="h-4 w-4 ml-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/inventory/add" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    New Ingredient
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/inventory/purchase" className="flex items-center">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Purchase Existing
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Input placeholder="Filter ingredients..." className="max-w-sm" />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="dry">Dry Goods</SelectItem>
              <SelectItem value="dairy">Dairy</SelectItem>
              <SelectItem value="fresh">Fresh Produce</SelectItem>
              <SelectItem value="spices">Spices</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9 px-2 lg:px-3">
            <Filter className="h-4 w-4" />
            <span className="ml-2 hidden lg:inline">Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="ml-auto h-9 px-2 lg:px-3">
            <ArrowUpDown className="h-4 w-4" />
            <span className="ml-2 hidden lg:inline">Sort</span>
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Expiration Date</TableHead>

                <TableHead>Batch/Lot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredientsData.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">{ingredient.name}</TableCell>
                  <TableCell>{ingredient.category}</TableCell>
                  <TableCell>{ingredient.quantity}</TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell>{ingredient.expirationDate}</TableCell>
                  <TableCell>{ingredient.batchLot}</TableCell>
                  <TableCell>
                    <Badge variant={ingredient.status === "In Stock" ? "outline" : "destructive"}>
                      {ingredient.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                          <svg
                            className="h-4 w-4 ml-1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={`/inventory/${ingredient.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/inventory/purchase?id=${ingredient.id}`} className="flex items-center">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Purchase More
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/inventory/edit/${ingredient.id}`} className="flex items-center">
                            Edit
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

