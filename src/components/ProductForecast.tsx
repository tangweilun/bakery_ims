import { PredictionResult } from "../app/model/type";

interface ProductForecastProps {
  prediction: PredictionResult;
}

export default function ProductForecast({ prediction }: ProductForecastProps) {
  return (
    <div className="border rounded-md p-4">
      <h4 className="font-medium text-lg">{prediction.productName}</h4>
      <p className="text-2xl font-bold mt-1">
        {prediction.predictedQuantity} units
      </p>

      <div className="mt-3">
        <h5 className="text-sm font-medium text-gray-500">
          Required Ingredients:
        </h5>
        <ul className="mt-1 space-y-1">
          {Object.entries(prediction.ingredients).map(
            ([ingredient, amount]) => (
              <li key={ingredient} className="text-sm">
                {ingredient}: {amount.toFixed(2)}{" "}
                {ingredient === "water" ? "liters" : "kg"}
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}
