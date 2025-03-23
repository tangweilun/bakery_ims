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

export interface BatchUsageData {
  batch: Batch;
  batchUsages: BatchUsage[];
}

export interface BatchUsage {
  id: number;
  batchId: number;
  usageRecordId: number;
  quantityUsed: number;
  createdAt: string;
  usageRecord: {
    id: number;
    reason: string;
    notes: string | null;
    createdAt: string;
    user: {
      name: string | null;
      email: string;
    };
    productionRecord: {
      recipe: {
        name: string;
      };
      quantity: number;
    } | null;
  };
}
