import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Providers from "@/lib/provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "BakeryTrack",
  description: "Smart Bakery Inventory System",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children} <SpeedInsights />
        </Providers>
        <ToastContainer position="bottom-right" theme="light" />
      </body>
    </html>
  );
}
