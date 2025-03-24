import { Badge } from "@/components/ui/badge";

export function ExpiringIngredients() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Milk</p>
          <p className="text-sm text-muted-foreground">Expires in 2 days</p>
        </div>
        <div className="ml-auto font-medium">
          <Badge variant="destructive">Critical</Badge>
        </div>
      </div>
      <div className="flex items-center">
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Eggs</p>
          <p className="text-sm text-muted-foreground">Expires in 5 days</p>
        </div>
        <div className="ml-auto font-medium">
          <Badge variant="destructive">Critical</Badge>
        </div>
      </div>
      <div className="flex items-center">
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Fresh Berries</p>
          <p className="text-sm text-muted-foreground">Expires in 7 days</p>
        </div>
        <div className="ml-auto font-medium">
          <Badge variant="outline">Warning</Badge>
        </div>
      </div>
      <div className="flex items-center">
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Cream Cheese</p>
          <p className="text-sm text-muted-foreground">Expires in 10 days</p>
        </div>
        <div className="ml-auto font-medium">
          <Badge variant="outline">Notice</Badge>
        </div>
      </div>
      <div className="flex items-center">
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Butter</p>
          <p className="text-sm text-muted-foreground">Expires in 14 days</p>
        </div>
        <div className="ml-auto font-medium">
          <Badge variant="outline">Notice</Badge>
        </div>
      </div>
    </div>
  );
}
