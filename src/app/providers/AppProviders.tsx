import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { queryClient } from "@/app/providers/queryClient";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
