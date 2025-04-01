import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Providers from "@/lib/provider";

export const metadata: Metadata = {
  title: "BakeryTrack - Bakery Inventory Management",
  description: "Efficiently manage your bakery inventory and forecasting",
  icons: {
    icon: "/bakeryTrackLogo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/bakeryTrackLogo.png" />
      </head>
      <body>
        <Providers>{children}</Providers>
        <ToastContainer position="bottom-right" theme="light" />
      </body>
    </html>
  );
}
