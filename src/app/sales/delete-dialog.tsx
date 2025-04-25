// app/sales/delete-dialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { format } from "date-fns";

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

interface DeleteSaleDialogProps {
  sale: Sale;
  onDelete: (saleId: number) => void;
}

export function DeleteSaleDialog({ sale, onDelete }: DeleteSaleDialogProps) {
  const handleDelete = () => {
    onDelete(sale.id);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p>Are you sure you want to delete this sale?</p>
        <p className="font-medium mt-2">
          Sale from {format(new Date(sale.datetime), "PPP")} with total amount $
          {sale.totalAmount.toFixed(2)}
        </p>
        <div className="mt-2 text-sm text-muted-foreground">
          {sale.saleItems.map((item, i) => (
            <div key={i}>
              {item.quantity} x {item.recipe?.name}
            </div>
          ))}
        </div>
        <p className="text-sm text-red-500 mt-4">
          This action cannot be undone.
        </p>
      </div>
      <DialogFooter>
        <Button variant="destructive" onClick={() => onDelete(sale.id)}>
          Delete Sale
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
