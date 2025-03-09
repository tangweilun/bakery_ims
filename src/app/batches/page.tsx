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
import { PlusCircle, Filter, ArrowUpDown } from "lucide-react"

export const metadata: Metadata = {
  title: "Batch Tracking",
  description: "Track batches and lots of ingredients",
}

export default function BatchesPage() {
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
          <h2 className="text-3xl font-bold tracking-tight">Batch Tracking</h2>
          <div className="flex items-center space-x-2">
            <Button>
              <Link href="/batches/add" className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Batch
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Input placeholder="Search batches..." className="max-w-sm" />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
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
                <TableHead>Batch ID</TableHead>
                <TableHead>Recipe</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">BATCH-1234</TableCell>
                <TableCell>Chocolate Cake</TableCell>
                <TableCell>2023-06-01</TableCell>
                <TableCell>2023-06-01</TableCell>
                <TableCell>24 units</TableCell>
                <TableCell>
                  <Badge variant="outline">Completed</Badge>
                </TableCell>
                <TableCell>Jane Doe</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">BATCH-1235</TableCell>
                <TableCell>Vanilla Cupcakes</TableCell>
                <TableCell>2023-06-02</TableCell>
                <TableCell>-</TableCell>
                <TableCell>48 units</TableCell>
                <TableCell>
                  <Badge>Active</Badge>
                </TableCell>
                <TableCell>John Smith</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">BATCH-1236</TableCell>
                <TableCell>Sourdough Bread</TableCell>
                <TableCell>2023-06-02</TableCell>
                <TableCell>-</TableCell>
                <TableCell>12 loaves</TableCell>
                <TableCell>
                  <Badge>Active</Badge>
                </TableCell>
                <TableCell>Maria Garcia</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">BATCH-1237</TableCell>
                <TableCell>Blueberry Muffins</TableCell>
                <TableCell>2023-06-03</TableCell>
                <TableCell>-</TableCell>
                <TableCell>36 units</TableCell>
                <TableCell>
                  <Badge variant="secondary">Pending</Badge>
                </TableCell>
                <TableCell>David Lee</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">BATCH-1238</TableCell>
                <TableCell>Croissants</TableCell>
                <TableCell>2023-06-03</TableCell>
                <TableCell>-</TableCell>
                <TableCell>24 units</TableCell>
                <TableCell>
                  <Badge variant="secondary">Pending</Badge>
                </TableCell>
                <TableCell>Sarah Johnson</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

