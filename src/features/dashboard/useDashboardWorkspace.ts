import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard.api";
import { listQueryDefaults } from "@/app/providers/queryClient";
import { adaptDashboardSummary } from "@/features/dashboard/dashboardSummaryAdapter";
import { queryKeys } from "@/lib/queryKeys";

export function useDashboardWorkspace() {
  const query = useQuery({
    queryKey: queryKeys.resource("dashboard").detail("summary"),
    queryFn: () => dashboardApi.summary(),
    ...listQueryDefaults,
    staleTime: 5 * 60_000,
  });

  return {
    isCorePending: query.isPending,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
    viewModel: query.data ? adaptDashboardSummary(query.data) : null,
    paymentsReady: !query.isPending,
    expiringReady: !query.isPending,
    maintenanceReady: !query.isPending,
  };
}
