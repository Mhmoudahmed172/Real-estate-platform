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

function optionalList<T>(
  query: { data?: T; error: unknown; isError: boolean },
  fallback: T,
  allowed: boolean,
): T {
  if (!allowed) return fallback;
  if (query.isError && isForbiddenError(query.error)) return fallback;
  return query.data ?? fallback;
}

function optionalReady(query: { data?: unknown; error: unknown; isFetched: boolean }, allowed: boolean) {
  if (!allowed) return true;
  if (isForbiddenError(query.error)) return true;
  return query.isFetched || Boolean(query.data);
}

export function useDashboardWorkspace() {
  const { can } = useAuthorization();
  const canContracts = can("contracts.view");
  const canMaintenance = can("maintenance.view");
  const canPayments = can("payments.view");
  const canTenants = can("tenants.view");
  const { propertiesQuery, unitsQuery } = useInventorySnapshot();
  const expiringQuery = useExpiringContracts(30, canContracts);

  const maintenanceQuery = useQuery({
    queryKey: queryKeys.resource("maintenance").list({ limit: 20 }),
    queryFn: () => maintenanceApi.list({ limit: 20 }),
    ...listQueryDefaults,
    enabled: canMaintenance,
  });

  const paymentsQuery = useQuery({
    queryKey: queryKeys.resource("payments").list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    queryFn: () => paymentsApi.list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    ...listQueryDefaults,
    enabled: canPayments,
  });

  const tenantsQuery = useQuery({
    queryKey: queryKeys.resource("tenants").list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    queryFn: () => tenantsApi.list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    ...listQueryDefaults,
    enabled: canTenants,
  });

  const queries = [propertiesQuery, unitsQuery, expiringQuery, maintenanceQuery, paymentsQuery, tenantsQuery];
  const isCorePending =
    (propertiesQuery.isPending && !isForbiddenError(propertiesQuery.error)) ||
    (unitsQuery.isPending && !isForbiddenError(unitsQuery.error));
  const isError = queries.some((query) => query.isError && !isForbiddenError(query.error));
  const refetch = () => {
    queries.forEach((query) => {
      void query.refetch();
    });
  };

  const properties = isForbiddenError(propertiesQuery.error) ? [] : propertiesQuery.data;
  const units = isForbiddenError(unitsQuery.error) ? [] : unitsQuery.data;
  const viewModel =
    properties && units
      ? buildDashboardViewModel({
          properties,
          units,
          expiringContracts: optionalList(expiringQuery, [], canContracts),
          maintenance: optionalList(maintenanceQuery, [], canMaintenance),
          payments: optionalList(paymentsQuery, [], canPayments),
          tenants: optionalList(tenantsQuery, [], canTenants),
        })
      : null;

  return {
    isCorePending,
    isError,
    refetch,
    viewModel,
    paymentsReady: optionalReady(paymentsQuery, canPayments),
    expiringReady: optionalReady(expiringQuery, canContracts) && optionalReady(tenantsQuery, canTenants),
    maintenanceReady: optionalReady(maintenanceQuery, canMaintenance),
  };
}
