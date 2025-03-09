"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Search } from "@/components/search"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

// Mock data for demonstration
const recipes = [
  {
    id: "1",
    name: "Chocolate Cake",
    ingredients: [
      { id: "1", name: "All-Purpose Flour", quantity: 2, unit: "kg" },
      { id: "2", name: "Granulated Sugar", quantity: 1.5, unit: "kg" },
      { id: "3", name: "Cocoa Powder", quantity: 0.5, unit: "kg" },
      { id: "4", name: "Eggs", quantity: 8, unit: "pcs" },
      { id: "5", name: "Milk", quantity: 0.5, unit: "L" },
    ],
  },
  {
    id: "2",
    name: "Vanilla Cupcakes",
    ingredients: [
      { id: "1", name: "All-Purpose Flour", quantity: 1, unit: "kg" },
      { id: "2", name: "Granulated Sugar", quantity: 0.75, unit: "kg" },
      { id: "4", name: "Eggs", quantity: 4, unit: "pcs" },
      { id: "5", name: "Milk", quantity: 0.25, unit: "L" },
    ],
  },
]

const ingredientStock = [
  {
    id: "1",
    name: "All-Purpose Flour",
    batches: [
      { id: "B001", quantity: 10, expirationDate: "2024-12-15", purchaseDate: "2023-06-01" },
      { id: "B002", quantity: 15, expirationDate: "2024-12-20", purchaseDate: "2023-06-15" },
    ],
  },
  {
    id: "2",
    name: "Granulated Sugar",
    batches: [
      { id: "B003", quantity: 20, expirationDate: "2024-11-30", purchaseDate: "2023-05-15" },
      { id: "B004", quantity: 25, expirationDate: "2024-12-05", purchaseDate: "2023-06-01" },
    ],
  },
  {
    id: "3",
    name: "Cocoa Powder",
    batches: [{ id: "B005", quantity: 5, expirationDate: "2024-10-15", purchaseDate: "2023-05-01" }],
  },
  {
    id: "4",
    name: "Eggs",
    batches: [
      { id: "B006", quantity: 60, expirationDate: "2023-07-15", purchaseDate: "2023-06-15" },
      { id: "B007", quantity: 60, expirationDate: "2023-07-20", purchaseDate: "2023-06-20" },
    ],
  },
  {
    id: "5",
    name: "Milk",
    batches: [{ id: "B008", quantity: 5, expirationDate: "2023-07-05", purchaseDate: "2023-06-25" }],
  },
]

export default function YieldPage() {
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [wastedIngredients, setWastedIngredients] = useState({})
  const [alert, setAlert] = useState(null)

  const handleRecipeChange = (recipeId) => {
    const recipe = recipes.find((r) => r.id === recipeId)
    setSelectedRecipe(recipe)
    setWastedIngredients({})
  }

  const handleWastedIngredientChange = (ingredientId, amount) => {
    setWastedIngredients((prev) => ({
      ...prev,
      [ingredientId]: Number.parseFloat(amount) || 0,
    }))
  }

  const reduceStock = () => {
    const updatedStock = JSON.parse(JSON.stringify(ingredientStock))
    let insufficientStock = false

    if (selectedRecipe) {
      selectedRecipe.ingredients.forEach((ingredient) => {
        const stockIngredient = updatedStock.find((i) => i.id === ingredient.id)
        if (stockIngredient) {
          let requiredQuantity = ingredient.quantity * quantity
          requiredQuantity += wastedIngredients[ingredient.id] || 0

          let remainingQuantity = requiredQuantity
          stockIngredient.batches.sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate))

          for (let i = 0; i < stockIngredient.batches.length; i++) {
            if (remainingQuantity <= 0) break

            if (stockIngredient.batches[i].quantity >= remainingQuantity) {
              stockIngredient.batches[i].quantity -= remainingQuantity
              remainingQuantity = 0
            } else {
              remainingQuantity -= stockIngredient.batches[i].quantity
              stockIngredient.batches[i].quantity = 0
            }
          }

          if (remainingQuantity > 0) {
            insufficientStock = true
          }

          stockIngredient.batches = stockIngredient.batches.filter((batch) => batch.quantity > 0)
        }
      })

      if (insufficientStock) {
        setAlert({
          title: "Insufficient Stock",
          description: "There is not enough stock for the selected recipe and quantity.",
          variant: "destructive",
        })
      } else {
        // In a real application, you would update the database here
        setAlert({
          title: "Stock Updated",
          description: "The ingredient stock has been successfully updated.",
          variant: "default",
        })
        // For demonstration purposes, we're logging the updated stock
        console.log("Updated Stock:", updatedStock)
      }
    }
  }

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
          <h2 className="text-3xl font-bold tracking-tight">Yield Management</h2>
        </div>
        {alert && (
          <Alert variant={alert.variant}>
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Recipe</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleRecipeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a recipe" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
              />
            </CardContent>
          </Card>
        </div>
        {selectedRecipe && (
          <Card>
            <CardHeader>
              <CardTitle>Recipe Ingredients</CardTitle>
              <CardDescription>Adjust for any wasted ingredients</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Required Quantity</TableHead>
                    <TableHead>Wasted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRecipe.ingredients.map((ingredient) => (
                    <TableRow key={ingredient.id}>
                      <TableCell>{ingredient.name}</TableCell>
                      <TableCell>
                        {ingredient.quantity * quantity} {ingredient.unit}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0"
                            value={wastedIngredients[ingredient.id] || ""}
                            onChange={(e) => handleWastedIngredientChange(ingredient.id, e.target.value)}
                          />
                          <span>{ingredient.unit}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        <div className="flex justify-end">
          <Button onClick={reduceStock} disabled={!selectedRecipe}>
            Update Stock
          </Button>
        </div>
      </div>
    </div>
  )
}

