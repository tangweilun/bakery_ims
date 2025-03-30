"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "@/types/activity";
import { toast } from "react-toastify";

/**
 * Generates a summary string based on the activity's action and details.
 * @param activity - The activity object containing action and details.
 * @returns A formatted summary string.
 */
interface ActivityDetails {
  quantity?: number;
  unit?: string;
  batchNumber?: string;
}

function getActivitySummary(activity: Activity) {
  let details: ActivityDetails = {};

  try {
    details = JSON.parse(activity.details || "{}") as ActivityDetails;
  } catch {
    details = {};
  }

  switch (activity.action) {
    case "INGREDIENT_ADDED":
      return `+${details.quantity || 0}${details.unit || ""}`;
    case "INGREDIENT_USED":
      return `-${details.quantity || 0}${details.unit || ""}`;
    case "PRODUCTION_COMPLETED":
      return `Batch #${details.batchNumber || ""}`;
    case "RECIPE_CREATED":
      return "New Recipe";
    case "ALERT_GENERATED":
      return "Alert";
    default:
      return "";
  }
}

/**
 * Skeleton component to display a placeholder while activities are loading.
 * Renders 5 placeholder items mimicking the RecentActivity layout.
 */
function SkeletonRecentActivity() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center">
          {/* Avatar placeholder */}
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="ml-4 space-y-1">
            {/* Description placeholder */}
            <Skeleton className="h-4 w-[200px]" />
            {/* Timestamp placeholder */}
            <Skeleton className="h-4 w-[100px]" />
          </div>
          {/* Summary placeholder */}
          <div className="ml-auto">
            <Skeleton className="h-4 w-[50px]" />
          </div>
          {index < 4 && <div className="border-b border-gray-200 my-4" />}
        </div>
      ))}
    </div>
  );
}

/**
 * RecentActivity component that fetches and displays a list of activities.
 * Shows a skeleton loader while data is being fetched.
 */
export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await fetch("/api/activities");
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        toast.error("Failed to fetch activities");
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    }
    fetchActivities();
  }, []);

  // Display skeleton while loading
  if (loading) {
    return <SkeletonRecentActivity />;
  }

  // Display actual activities once loaded
  return (
    <div className="space-y-8">
      {activities.map((activity, index) => (
        <div key={activity.id}>
          <div className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars.jpeg" alt="Avatar" />
              <AvatarFallback>{activity.user.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {activity.description} by{" "}
                <span className="font-bold">
                  {activity.user.email || "Unknown User"}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
