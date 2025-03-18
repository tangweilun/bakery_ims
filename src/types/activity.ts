export type Activity =
  | {
      id: number;
      action: "INGREDIENT_ADDED" | "INGREDIENT_USED";
      description: string;
      details: string; // JSON string, e.g., '{"quantity": 5, "unit": "kg"}'
      user: {
        name: string | null;
        email: string | null;
      };
      createdAt: string;
    }
  | {
      id: number;
      action: "PRODUCTION_COMPLETED";
      description: string;
      details: string; // JSON string, e.g., '{"batchNumber": "B123"}'
      user: {
        name: string | null;
        email: string | null;
      };
      createdAt: string;
    }
  | {
      id: number;
      action: "RECIPE_CREATED" | "ALERT_GENERATED";
      description: string;
      details: string | null; // Optional JSON string or null
      user: {
        name: string | null;
        email: string | null;
      };
      createdAt: string;
    }
  | {
      id: number;
      action: string; // Catch-all for unrecognized actions
      description: string;
      details: string | null;
      user: {
        name: string | null;
        email: string | null;
      };
      createdAt: string;
    };
