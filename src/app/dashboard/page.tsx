import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecentActivity } from "@/components/recent-activity";
import { ExpiringIngredients } from "@/components/expiring-ingredients";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";

export const metadata: Metadata = {
  title: "Bakery Inventory System",
  description: "Manage your bakery ingredients efficiently",
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between space-y-2 mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Expiring Ingredients</CardTitle>
              <CardDescription>
                Ingredients expiring within the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpiringIngredients />
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Recent inventory and recipe activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
