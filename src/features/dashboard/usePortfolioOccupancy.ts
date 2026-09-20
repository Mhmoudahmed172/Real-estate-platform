import { isForbiddenError } from "@/api/errors";
import { dashboardApi } from "@/api/dashboard.api";
import { useQuery } from "@tanstack/react-query";
import { listQueryDefaults } from "@/app/providers/queryClient";
import { queryKeys } from "@/lib/queryKeys";

export function usePortfolioOccupancy() {
  const summaryQuery = useQuery({
    queryKey: queryKeys.resource("dashboard").detail("summary"),
    queryFn: () => dashboardApi.summary(),
    ...listQueryDefaults,
    staleTime: 5 * 60_000,
  });
  if (summaryQuery.isError && isForbiddenError(summaryQuery.error)) return null;
  const units = summaryQuery.data?.units;
  if (!units || units.total === 0) return null;
  return (units.rented / units.total) * 100;
}
