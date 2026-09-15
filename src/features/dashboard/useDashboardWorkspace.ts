import { useQuery } from "@tanstack/react-query";
import { contractsApi } from "@/api/contracts.api";
import { maintenanceApi } from "@/api/maintenance.api";
import { paymentsApi } from "@/api/payments.api";
import { tenantsApi } from "@/api/tenants.api";
import { DASHBOARD_SNAPSHOT_LIMIT, useInventorySnapshot } from "@/features/dashboard/useInventorySnapshot";
import { buildDashboardViewModel } from "@/features/dashboard/dashboardAdapter";
import { queryKeys } from "@/lib/queryKeys";

export function useDashboardWorkspace() {
  const { propertiesQuery, unitsQuery } = useInventorySnapshot();

  const expiringQuery = useQuery({
    queryKey: queryKeys.resource("contracts").list({ expiring: 30 }),
    queryFn: () => contractsApi.expiring({ days: 30 }),
  });

  const maintenanceQuery = useQuery({
    queryKey: queryKeys.resource("maintenance").list({ limit: 20 }),
    queryFn: () => maintenanceApi.list({ limit: 20 }),
  });

  const paymentsQuery = useQuery({
    queryKey: queryKeys.resource("payments").list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    queryFn: () => paymentsApi.list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
  });

  const tenantsQuery = useQuery({
    queryKey: queryKeys.resource("tenants").list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    queryFn: () => tenantsApi.list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
  });

  const queries = [propertiesQuery, unitsQuery, expiringQuery, maintenanceQuery, paymentsQuery, tenantsQuery];
  const isLoading = queries.some((query) => query.isPending);
  const isError = queries.some((query) => query.isError);
  const refetch = () => {
    queries.forEach((query) => {
      void query.refetch();
    });
  };

  const viewModel =
    propertiesQuery.data && unitsQuery.data && expiringQuery.data && maintenanceQuery.data && paymentsQuery.data && tenantsQuery.data
      ? buildDashboardViewModel({
          properties: propertiesQuery.data,
          units: unitsQuery.data,
          expiringContracts: expiringQuery.data,
          maintenance: maintenanceQuery.data,
          payments: paymentsQuery.data,
          tenants: tenantsQuery.data,
        })
      : null;

  return { isLoading, isError, refetch, viewModel };
}
