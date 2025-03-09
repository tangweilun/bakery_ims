import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentActivity() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Jane Doe added 25kg of Flour</p>
          <p className="text-sm text-muted-foreground">Today at 10:30 AM</p>
        </div>
        <div className="ml-auto font-medium">+25kg</div>
      </div>
      <div className="flex items-center">
        <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Jane Doe used Chocolate Cake recipe</p>
          <p className="text-sm text-muted-foreground">Today at 9:15 AM</p>
        </div>
        <div className="ml-auto font-medium">-3.5kg Flour</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Jane Doe marked Batch #1234 as complete</p>
          <p className="text-sm text-muted-foreground">Yesterday at 3:45 PM</p>
        </div>
        <div className="ml-auto font-medium">Batch #1234</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Jane Doe added new recipe: Blueberry Muffins</p>
          <p className="text-sm text-muted-foreground">Yesterday at 1:30 PM</p>
        </div>
        <div className="ml-auto font-medium">New Recipe</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">System flagged low stock: Sugar</p>
          <p className="text-sm text-muted-foreground">Yesterday at 11:20 AM</p>
        </div>
        <div className="ml-auto font-medium">Alert</div>
      </div>
    </div>
  )
}

