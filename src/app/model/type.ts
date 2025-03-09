export interface Product {
  id: string;
  name: string;
  ingredients: {
    [key: string]: number; // Maps ingredient name to amount per unit
  };
}

export interface SalesRecord {
  date: string;
  productId: string;
  quantity: number;
}

export interface PredictionResult {
  productId: string;
  productName: string;
  predictedQuantity: number;
  ingredients: {
    [key: string]: number;
  };
}
