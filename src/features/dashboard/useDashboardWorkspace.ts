import { useQuery } from "@tanstack/react-query";
import { maintenanceApi } from "@/api/maintenance.api";
import { paymentsApi } from "@/api/payments.api";
import { tenantsApi } from "@/api/tenants.api";
import { listQueryDefaults } from "@/app/providers/queryClient";
import { DASHBOARD_SNAPSHOT_LIMIT, useInventorySnapshot } from "@/features/dashboard/useInventorySnapshot";
import { buildDashboardViewModel } from "@/features/dashboard/dashboardAdapter";
import { useExpiringContracts } from "@/features/contracts/useContracts";
import { queryKeys } from "@/lib/queryKeys";

export function useDashboardWorkspace() {
  const { propertiesQuery, unitsQuery } = useInventorySnapshot();
  const expiringQuery = useExpiringContracts(30);

  const maintenanceQuery = useQuery({
    queryKey: queryKeys.resource("maintenance").list({ limit: 20 }),
    queryFn: () => maintenanceApi.list({ limit: 20 }),
    ...listQueryDefaults,
  });

  const paymentsQuery = useQuery({
    queryKey: queryKeys.resource("payments").list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    queryFn: () => paymentsApi.list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    ...listQueryDefaults,
  });

  const tenantsQuery = useQuery({
    queryKey: queryKeys.resource("tenants").list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    queryFn: () => tenantsApi.list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    ...listQueryDefaults,
  });

  const queries = [propertiesQuery, unitsQuery, expiringQuery, maintenanceQuery, paymentsQuery, tenantsQuery];
  const isCorePending = propertiesQuery.isPending || unitsQuery.isPending;
  const isError = queries.some((query) => query.isError);
  const refetch = () => {
    queries.forEach((query) => {
      void query.refetch();
    });
  };

  const viewModel =
    propertiesQuery.data && unitsQuery.data
      ? buildDashboardViewModel({
          properties: propertiesQuery.data,
          units: unitsQuery.data,
          expiringContracts: expiringQuery.data ?? [],
          maintenance: maintenanceQuery.data ?? [],
          payments: paymentsQuery.data ?? [],
          tenants: tenantsQuery.data ?? [],
        })
      : null;

  return {
    isCorePending,
    isError,
    refetch,
    viewModel,
    paymentsReady: Boolean(paymentsQuery.data),
    expiringReady: Boolean(expiringQuery.data && tenantsQuery.data),
    maintenanceReady: Boolean(maintenanceQuery.data),
  };
}
