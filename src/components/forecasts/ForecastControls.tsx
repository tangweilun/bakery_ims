'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ForecastControlsProps {
  params: {
    days: number;
    forecastDays: number;
    windowSize: number;
  };
  onChange: (params: any) => void;
}

export function ForecastControls({ params, onChange }: ForecastControlsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Historical Data (days)</Label>
          <span className="text-sm font-medium">{params.days}</span>
        </div>
        <Slider
          value={[params.days]}
          min={30}
          max={365}
          step={1}
          onValueChange={(value) => onChange({ ...params, days: value[0] })}
        />
        <p className="text-xs text-muted-foreground">
          Amount of historical sales data to use for training
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Forecast Horizon (days)</Label>
          <span className="text-sm font-medium">{params.forecastDays}</span>
        </div>
        <Slider
          value={[params.forecastDays]}
          min={7}
          max={90}
          step={1}
          onValueChange={(value) =>
            onChange({ ...params, forecastDays: value[0] })
          }
        />
        <p className="text-xs text-muted-foreground">
          Number of days to forecast into the future
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Window Size</Label>
          <span className="text-sm font-medium">{params.windowSize}</span>
        </div>
        <Slider
          value={[params.windowSize]}
          min={3}
          max={14}
          step={1}
          onValueChange={(value) =>
            onChange({ ...params, windowSize: value[0] })
          }
        />
        <p className="text-xs text-muted-foreground">
          Number of days to consider for each prediction (affects model accuracy)
        </p>
      </div>
    </div>
  );
}