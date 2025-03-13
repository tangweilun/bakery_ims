"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Search } from "@/components/search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChevronLeft, Printer } from "lucide-react";
import Link from "next/link";

// Define TypeScript interfaces for type safety
interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface AlertType {
  title: string;
  description: string;
  variant: "default" | "destructive";
}

// Mock data for demonstration
const recipes: Recipe[] = [
  {
    id: "1",
    name: "Chocolate Cake",
    description: "Classic chocolate cake with ganache",
    prepTime: 45,
    servings: 8,
    ingredients: [
      { id: "1", name: "All-Purpose Flour", quantity: 350, unit: "g" },
      { id: "2", name: "Granulated Sugar", quantity: 300, unit: "g" },
      { id: "3", name: "Cocoa Powder", quantity: 75, unit: "g" },
      { id: "4", name: "Eggs", quantity: 4, unit: "pcs" },
      { id: "5", name: "Milk", quantity: 250, unit: "ml" },
      { id: "6", name: "Vegetable Oil", quantity: 120, unit: "ml" },
      { id: "7", name: "Vanilla Extract", quantity: 10, unit: "ml" },
      { id: "8", name: "Baking Powder", quantity: 10, unit: "g" },
    ],
    instructions: [
      "Preheat oven to 350°F (175°C) and grease two 9-inch round cake pans.",
      "In a large bowl, whisk together flour, sugar, cocoa powder, and baking powder.",
      "Add eggs, milk, oil, and vanilla extract. Beat with an electric mixer for 2 minutes.",
      "Pour batter evenly into prepared pans.",
      "Bake for 30-35 minutes or until a toothpick inserted comes out clean.",
      "Allow to cool completely before frosting.",
      "For the ganache, heat 1 cup of heavy cream until simmering, then pour over 8 oz of chopped chocolate. Let sit for 5 minutes, then stir until smooth.",
      "Pour ganache over cooled cake and spread evenly.",
    ],
    notes:
      "For a richer flavor, use Dutch-processed cocoa powder. The cake can be made a day ahead and stored in an airtight container.",
    tags: ["Dessert", "Chocolate", "Cake", "Celebration"],
    createdAt: "2023-01-15",
    updatedAt: "2023-05-20",
  },
  // More recipes would be here
];

export default function RecipeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [alert, setAlert] = useState<AlertType | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call
    const foundRecipe = recipes.find((r) => r.id === params.id);
    if (foundRecipe) {
      setRecipe(foundRecipe);
    } else {
      setAlert({
        title: "Recipe Not Found",
        description: "The requested recipe could not be found.",
        variant: "destructive",
      });
    }
  }, [params.id]);

  if (!recipe) {
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
          {alert && (
            <Alert variant={alert.variant}>
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/recipes" className="flex items-center">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Link>
          </Button>
        </div>
      </div>
    );
  }

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
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/recipes" className="flex items-center">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Link>
          </Button>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{recipe.name}</h2>
            <p className="text-muted-foreground">{recipe.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="flex items-center">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center bg-muted rounded-md px-3 py-1">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{recipe.prepTime} mins</span>
          </div>
          <div className="flex items-center bg-muted rounded-md px-3 py-1">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Serves {recipe.servings}</span>
          </div>
          {recipe.tags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <Tabs defaultValue="ingredients" className="mt-6">
          <TabsList>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="ingredients">
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
                <CardDescription>
                  For {recipe.servings} servings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Stock Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipe.ingredients.map((ingredient) => (
                      <TableRow key={ingredient.id}>
                        <TableCell className="font-medium">
                          {ingredient.name}
                        </TableCell>
                        <TableCell>{ingredient.quantity}</TableCell>
                        <TableCell>{ingredient.unit}</TableCell>
                        <TableCell>
                          <Badge variant="outline">In Stock</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="instructions">
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
                <CardDescription>
                  Step-by-step preparation guide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4 list-decimal list-inside">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="pl-2">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>
                  Additional information and tips
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{recipe.notes}</p>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Last updated: {recipe.updatedAt}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
