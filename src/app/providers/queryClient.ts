import { QueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/api/errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: (failureCount, error) => {
        const message = getApiErrorMessage(error);
        if (message.status && message.status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
