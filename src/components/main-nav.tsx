import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
        Dashboard
      </Link>
      <Link
        href="/inventory"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Inventory
      </Link>
      <Link href="/recipes" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Recipes
      </Link>
      <Link href="/batches" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Batch Tracking
      </Link>
      <Link href="/yield" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Yield Management
      </Link>
      <Link
        href="/forecasting"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Forecasting
      </Link>
    </nav>
  )
}

