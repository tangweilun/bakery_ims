export interface Batch {
  id: number;
  batchNumber: string;
  ingredientId: number;
  ingredient: {
    id: number;
    name: string;
    unit: string;
    category: string;
  };
  quantity: number;
  remainingQuantity: number;
  cost: number;
  expiryDate: Date | null;
  receivedDate: Date;
  location: string | null;
  notes: string | null;
}
