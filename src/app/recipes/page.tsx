import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Search } from "@/components/search"
import Link from "next/link"
import { PlusCircle, Filter, ArrowUpDown, Clock, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Recipe Management",
  description: "Manage your bakery recipes",
}

export default function RecipesPage() {
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
          <h2 className="text-3xl font-bold tracking-tight">Recipes</h2>
          <div className="flex items-center space-x-2">
            <Button>
              <Link href="/recipes/add" className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Recipe
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Input placeholder="Search recipes..." className="max-w-sm" />
          <Button variant="outline" size="sm" className="h-9 px-2 lg:px-3">
            <Filter className="h-4 w-4" />
            <span className="ml-2 hidden lg:inline">Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="ml-auto h-9 px-2 lg:px-3">
            <ArrowUpDown className="h-4 w-4" />
            <span className="ml-2 hidden lg:inline">Sort</span>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Chocolate Cake</CardTitle>
              <CardDescription>Classic chocolate cake with ganache</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>45 mins</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span>Serves 8</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Flour</span>
                  <span>350g</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sugar</span>
                  <span>300g</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Cocoa Powder</span>
                  <span>75g</span>
                </div>
                <div className="text-muted-foreground text-sm mt-2">+5 more ingredients</div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                Scale Recipe
              </Button>
              <Button size="sm">View Details</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Vanilla Cupcakes</CardTitle>
              <CardDescription>Light and fluffy vanilla cupcakes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>30 mins</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span>Makes 12</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Flour</span>
                  <span>210g</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sugar</span>
                  <span>200g</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Butter</span>
                  <span>115g</span>
                </div>
                <div className="text-muted-foreground text-sm mt-2">+4 more ingredients</div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                Scale Recipe
              </Button>
              <Button size="sm">View Details</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Sourdough Bread</CardTitle>
              <CardDescription>Artisan sourdough with crispy crust</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>24 hrs</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span>1 loaf</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Bread Flour</span>
                  <span>500g</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Water</span>
                  <span>350g</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Starter</span>
                  <span>100g</span>
                </div>
                <div className="text-muted-foreground text-sm mt-2">+2 more ingredients</div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                Scale Recipe
              </Button>
              <Button size="sm">View Details</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Blueberry Muffins</CardTitle>
              <CardDescription>Moist muffins with fresh blueberries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>35 mins</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  <span>Makes 12</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Flour</span>
                  <span>250g</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sugar</span>
                  <span>150g</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Blueberries</span>
                  <span>200g</span>
                </div>
                <div className="text-muted-foreground text-sm mt-2">+6 more ingredients</div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                Scale Recipe
              </Button>
              <Button size="sm">View Details</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

