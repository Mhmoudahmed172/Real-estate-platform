import { useQuery } from "@tanstack/react-query";
import { propertiesApi } from "@/api/properties.api";
import { unitsApi } from "@/api/units.api";
import { queryKeys } from "@/lib/queryKeys";

export const DASHBOARD_SNAPSHOT_LIMIT = 500;

export function useInventorySnapshot() {
  const propertiesQuery = useQuery({
    queryKey: queryKeys.properties.list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    queryFn: () => propertiesApi.list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
  });

  const unitsQuery = useQuery({
    queryKey: queryKeys.resource("units").list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
    queryFn: () => unitsApi.list({ limit: DASHBOARD_SNAPSHOT_LIMIT }),
  });

  return { propertiesQuery, unitsQuery };
}
