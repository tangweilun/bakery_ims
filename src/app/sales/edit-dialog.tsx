// app/sales/edit-dialog.tsx
"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { XCircleIcon } from "lucide-react";

// Types for our data
type Recipe = {
  id: number;
  name: string;
  sellingPrice: number;
};

type SaleItem = {
  recipeId: number;
  quantity: number;
  unitPrice: number;
  recipe?: Recipe;
};

type Sale = {
  id: number;
  datetime: string;
  dayOfWeek: string;
  totalAmount: number;
  saleItems: SaleItem[];
};

interface EditSaleDialogProps {
  sale: Sale;
  recipes: Recipe[];
  onSave: (updatedSale: Sale) => void;
}

export function EditSaleDialog({ sale, recipes, onSave }: EditSaleDialogProps) {
  const [editedSale, setEditedSale] = useState<{
    id: number;
    datetime: string;
    saleItems: SaleItem[];
  }>({
    id: sale.id,
    datetime: sale.datetime,
    saleItems: [...sale.saleItems],
  });

  // Reset state whenever the sale prop changes or dialog reopens
  useEffect(() => {
    setEditedSale({
      id: sale.id,
      datetime: sale.datetime,
      saleItems: [...sale.saleItems],
    });
  }, [sale]);

  const addSaleItem = () => {
    if (recipes.length === 0) return;

    setEditedSale((prev) => ({
      ...prev,
      saleItems: [
        ...prev.saleItems,
        {
          recipeId: recipes[0].id,
          quantity: 1,
          unitPrice: recipes[0].sellingPrice,
          recipe: recipes[0],
        },
      ],
    }));
  };

  const removeSaleItem = (index: number) => {
    setEditedSale((prev) => ({
      ...prev,
      saleItems: prev.saleItems.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    return editedSale.saleItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
  };

  const handleSave = () => {
    const updatedSale: Sale = {
      ...sale,
      datetime: editedSale.datetime,
      dayOfWeek: new Date(editedSale.datetime).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      totalAmount: calculateTotal(),
      saleItems: editedSale.saleItems,
    };
    onSave(updatedSale);
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Edit Sale</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="edit-date">Sale Date and Time</Label>
          <Input
            id="edit-date"
            type="datetime-local"
            value={editedSale.datetime.slice(0, 16)}
            onChange={(e) =>
              setEditedSale((prev) => ({
                ...prev,
                datetime: new Date(e.target.value).toISOString(),
              }))
            }
          />
        </div>

        <div className="space-y-3">
          <Label>Sale Items</Label>
          {editedSale.saleItems.length === 0 && (
            <p className="text-sm text-muted-foreground">No items added yet</p>
          )}
          {editedSale.saleItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={item.recipeId.toString()}
                onValueChange={(value) => {
                  const selectedRecipe = recipes.find(
                    (r) => r.id === parseInt(value)
                  );
                  setEditedSale((prev) => {
                    const newItems = [...prev.saleItems];
                    newItems[index] = {
                      ...newItems[index],
                      recipeId: parseInt(value),
                      unitPrice: selectedRecipe
                        ? selectedRecipe.sellingPrice
                        : 0.0,
                      recipe: selectedRecipe,
                    };
                    return { ...prev, saleItems: newItems };
                  });
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Recipe" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id.toString()}>
                      {recipe.name} (${recipe.sellingPrice.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Qty"
                className="w-20"
                min="1"
                value={item.quantity}
                onChange={(e) => {
                  const quantity = parseInt(e.target.value) || 1;
                  setEditedSale((prev) => {
                    const newItems = [...prev.saleItems];
                    newItems[index].quantity = quantity;
                    return { ...prev, saleItems: newItems };
                  });
                }}
              />

              <div className="text-sm w-16">
                ${(item.quantity * item.unitPrice).toFixed(2)}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSaleItem(index)}
              >
                <XCircleIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addSaleItem}>
            Add Item
          </Button>
        </div>

        {editedSale.saleItems.length > 0 && (
          <div className="text-right font-medium">
            Total: ${calculateTotal().toFixed(2)}
          </div>
        )}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </DialogClose>
        <Button
          onClick={handleSave}
          disabled={editedSale.saleItems.length === 0}
        >
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
