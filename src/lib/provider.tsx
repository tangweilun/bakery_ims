"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Next.js 15 specific options
            refetchOnWindowFocus: true, // Next.js 15 recommends enabling this
            staleTime: 5 * 1000, // 5 seconds
            retry: 2, // Retry failed requests 2 times
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
