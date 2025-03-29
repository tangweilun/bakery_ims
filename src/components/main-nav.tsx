"use client";

import type React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/ingredients", label: "Ingredient" },
    { href: "/suppliers", label: "Supplier" },
    { href: "/recipes", label: "Recipes" },
    { href: "/batches", label: "Batch Tracking" },
    { href: "/yield", label: "Yield Management" },
    { href: "/sales", label: "Sales" },
    { href: "/forecasting", label: "Forecasting" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const renderNavItems = (isMobile = false) => {
    return navItems.map((item, index) => {
      const isActive =
        item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

      return (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, y: isMobile ? 10 : -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={cn("relative", isMobile ? "w-full" : "")}
        >
          <Link
            href={item.href}
            onClick={isMobile ? toggleMenu : undefined}
            className={cn(
              "relative block px-3 py-2 text-sm font-medium transition-colors rounded-md",
              "hover:text-indigo-600 hover:bg-indigo-50",
              "focus:outline-none focus:ring-2 focus:ring-indigo-200",
              isActive ? "text-indigo-600" : "text-gray-600",
              isMobile
                ? "text-center w-full hover:bg-indigo-100 py-3"
                : "inline-block"
            )}
          >
            {item.label}
            {isActive && !isMobile && (
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                layoutId="activeNavIndicator"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
          </Link>
        </motion.div>
      );
    });
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={cn(
          "hidden md:flex items-center space-x-1 md:space-x-2 lg:space-x-4",
          className
        )}
        {...props}
      >
        {renderNavItems()}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center">
        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMenu}
          className="p-2 focus:outline-none"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={toggleMenu}
            />
          )}
        </AnimatePresence>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween" }}
              className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 py-8 px-4 overflow-y-auto"
            >
              <div className="flex flex-col space-y-2">
                {renderNavItems(true)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
