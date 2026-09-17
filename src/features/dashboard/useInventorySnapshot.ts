import { useQuery } from "@tanstack/react-query";
import { propertiesApi } from "@/api/properties.api";
import { unitsApi } from "@/api/units.api";
import { listQueryDefaults } from "@/app/providers/queryClient";
import { queryKeys } from "@/lib/queryKeys";

export const DASHBOARD_SNAPSHOT_LIMIT = 500;
const SNAPSHOT_STALE_TIME = 5 * 60_000;

export function usePropertiesSnapshot() {
  return useQuery({
    queryKey: queryKeys.properties.list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    queryFn: () => propertiesApi.list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    ...listQueryDefaults,
    staleTime: SNAPSHOT_STALE_TIME,
  });
}

export function useUnitsSnapshot() {
  return useQuery({
    queryKey: queryKeys.resource("units").list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    queryFn: () => unitsApi.list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    ...listQueryDefaults,
    staleTime: SNAPSHOT_STALE_TIME,
  });
}

export function useInventorySnapshot() {
  const propertiesQuery = usePropertiesSnapshot();
  const unitsQuery = useUnitsSnapshot();
  return { propertiesQuery, unitsQuery };
}
