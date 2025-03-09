import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Search } from "@/components/search"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Add Ingredient",
  description: "Add a new ingredient to inventory",
}

export default function AddIngredientPage() {
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
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Link href="/inventory" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Add New Ingredient</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ingredient Name</Label>
              <Input id="name" placeholder="Enter ingredient name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dry">Dry Goods</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="fresh">Fresh Produce</SelectItem>
                  <SelectItem value="spices">Spices</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" placeholder="Enter quantity" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="g">Grams (g)</SelectItem>
                  <SelectItem value="l">Liters (L)</SelectItem>
                  <SelectItem value="ml">Milliliters (mL)</SelectItem>
                  <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                  <SelectItem value="dozen">Dozen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expiration">Expiration Date</Label>
              <Input id="expiration" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch">Batch/Lot Number</Label>
              <Input id="batch" placeholder="Enter batch or lot number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input id="supplier" placeholder="Enter supplier name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Enter any additional notes" />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>Add Ingredient</Button>
        </div>
      </div>
    </div>
  )
}

