export interface Ingredient {
  id: number;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  idealStock: number;
  cost: number;
  supplier?: {
    id: number;
    name: string;
  };
  location?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
