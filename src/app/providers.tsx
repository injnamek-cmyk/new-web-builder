"use client";

import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>{children}</SessionProvider>
      <Toaster position="top-right" richColors />
    </QueryProvider>
  );
}
