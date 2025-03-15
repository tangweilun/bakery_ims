"use client";

import type React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/ingredient", label: "Ingredient" },
    { href: "/suppliers", label: "Supplier" },
    { href: "/recipes", label: "Recipes" },
    { href: "/batches", label: "Batch Tracking" },
    { href: "/yield", label: "Yield Management" },
    { href: "/forecasting", label: "Forecasting" },
  ];

  return (
    <nav
      className={cn(
        "flex items-center space-x-1 md:space-x-2 lg:space-x-4",
        className
      )}
      {...props}
    >
      {navItems.map((item, index) => {
        // Check if this nav item is active
        // For the dashboard, only match exact path
        // For other pages, check if the pathname starts with the item's href
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="relative"
          >
            <Link
              href={item.href}
              className={cn(
                "relative px-3 py-2 text-sm font-medium transition-colors rounded-md",
                "hover:text-indigo-600 hover:bg-indigo-50",
                "focus:outline-none focus:ring-2 focus:ring-indigo-200",
                isActive ? "text-indigo-600" : "text-gray-600"
              )}
            >
              {item.label}
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                  layoutId="activeNavIndicator"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}
