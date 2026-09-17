import { useQuery } from "@tanstack/react-query";
import { isForbiddenError } from "@/api/errors";
import { maintenanceApi } from "@/api/maintenance.api";
import { paymentsApi } from "@/api/payments.api";
import { tenantsApi } from "@/api/tenants.api";
import { listQueryDefaults } from "@/app/providers/queryClient";
import { DASHBOARD_SNAPSHOT_LIMIT, useInventorySnapshot } from "@/features/dashboard/useInventorySnapshot";
import { buildDashboardViewModel } from "@/features/dashboard/dashboardAdapter";
import { useExpiringContracts } from "@/features/contracts/useContracts";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { queryKeys } from "@/lib/queryKeys";

function resolvedList<T>(query: { data?: T; error: unknown; isError: boolean }, fallback: T): T | undefined {
  if (query.isError && isForbiddenError(query.error)) return fallback;
  return query.data;
}

export function useDashboardWorkspace() {
  const { can } = useAuthorization();
  const { propertiesQuery, unitsQuery } = useInventorySnapshot();
  const expiringQuery = useExpiringContracts(30, can("contracts.view"));

  const maintenanceQuery = useQuery({
    queryKey: queryKeys.resource("maintenance").list({ limit: 20 }),
    queryFn: () => maintenanceApi.list({ limit: 20 }),
    ...listQueryDefaults,
    enabled: can("maintenance.view"),
  });

  const paymentsQuery = useQuery({
    queryKey: queryKeys.resource("payments").list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    queryFn: () => paymentsApi.list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    ...listQueryDefaults,
    enabled: can("payments.view"),
  });

  const tenantsQuery = useQuery({
    queryKey: queryKeys.resource("tenants").list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    queryFn: () => tenantsApi.list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    ...listQueryDefaults,
    enabled: can("tenants.view"),
  });

  const queries = [propertiesQuery, unitsQuery, expiringQuery, maintenanceQuery, paymentsQuery, tenantsQuery];
  const isCorePending = (propertiesQuery.isPending && !isForbiddenError(propertiesQuery.error)) || (unitsQuery.isPending && !isForbiddenError(unitsQuery.error));
  const isError = queries.some((query) => query.isError && !isForbiddenError(query.error));
  const refetch = () => {
    queries.forEach((query) => {
      void query.refetch();
    });
  };

  const properties = resolvedList(propertiesQuery, []);
  const units = resolvedList(unitsQuery, []);
  const viewModel =
    properties && units
      ? buildDashboardViewModel({
          properties,
          units,
          expiringContracts: resolvedList(expiringQuery, []) ?? [],
          maintenance: resolvedList(maintenanceQuery, []) ?? [],
          payments: resolvedList(paymentsQuery, []) ?? [],
          tenants: resolvedList(tenantsQuery, []) ?? [],
        })
      : null;

  return {
    isCorePending,
    isError,
    refetch,
    viewModel,
    paymentsReady: Boolean(resolvedList(paymentsQuery, [])),
    expiringReady: Boolean(resolvedList(expiringQuery, []) && resolvedList(tenantsQuery, [])),
    maintenanceReady: Boolean(resolvedList(maintenanceQuery, [])),
  };
}
