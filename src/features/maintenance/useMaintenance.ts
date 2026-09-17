import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { maintenanceApi } from "@/api/maintenance.api";
import { propertiesApi } from "@/api/properties.api";
import { unitsApi } from "@/api/units.api";
import { vendorsApi } from "@/api/vendors.api";
import { listQueryDefaults } from "@/app/providers/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import type { Id } from "@/types/api";
import type { Assignment, MaintenanceCreate, MaintenanceListParams, MaintenanceTransition, MaintenanceUpdate } from "@/types/resources";

const maintenanceKeys = queryKeys.resource("maintenance");
const vendorsKeys = queryKeys.resource("vendors");

export function useMaintenanceList(params: MaintenanceListParams) {
  return useQuery({ queryKey: maintenanceKeys.list(params), queryFn: () => maintenanceApi.list(params), ...listQueryDefaults });
}

export function useMaintenanceRequest(id: Id | undefined) {
  return useQuery({ queryKey: maintenanceKeys.detail(id ?? "unknown"), queryFn: () => maintenanceApi.get(Number(id)), enabled: id !== undefined });
}

export function useMaintenanceHistory(id: Id | undefined) {
  return useQuery({ queryKey: [...maintenanceKeys.detail(id ?? "unknown"), "history"] as const, queryFn: () => maintenanceApi.history(Number(id)), enabled: id !== undefined });
}

export function useMaintenanceOptions() {
  const propertiesQuery = useQuery({ queryKey: queryKeys.properties.list({ limit: 200 }), queryFn: () => propertiesApi.list({ limit: 200 }) });
  const vendorsQuery = useQuery({ queryKey: vendorsKeys.list({ limit: 200 }), queryFn: () => vendorsApi.list({ limit: 200 }) });
  return { propertiesQuery, vendorsQuery };
}

export function useMaintenanceRelations(request?: { property_id?: number | null; unit_id?: number | null; vendor_id?: number | null }) {
  const propertyQuery = useQuery({ queryKey: queryKeys.properties.detail(request?.property_id ?? "unknown"), queryFn: () => propertiesApi.get(request?.property_id as number), enabled: typeof request?.property_id === "number" });
  const unitQuery = useQuery({ queryKey: queryKeys.resource("units").detail(request?.unit_id ?? "unknown"), queryFn: () => unitsApi.get(request?.unit_id as number), enabled: typeof request?.unit_id === "number" });
  const vendorQuery = useQuery({ queryKey: vendorsKeys.detail(request?.vendor_id ?? "unknown"), queryFn: () => vendorsApi.get(request?.vendor_id as number), enabled: typeof request?.vendor_id === "number" });
  return { propertyQuery, unitQuery, vendorQuery };
}

export function useUnitsForMaintenanceProperty(propertyId: number | null | undefined) {
  return useQuery({ queryKey: queryKeys.properties.units(propertyId ?? "unknown"), queryFn: () => propertiesApi.units(propertyId as number), enabled: typeof propertyId === "number" });
}

export function useMaintenanceMutations() {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    await queryClient.invalidateQueries({ queryKey: vendorsKeys.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.workspace });
  };
  return {
    createMutation: useMutation({ mutationFn: (payload: MaintenanceCreate) => maintenanceApi.create(payload), onSuccess: invalidate }),
    updateMutation: useMutation({ mutationFn: ({ id, payload }: { id: Id; payload: MaintenanceUpdate }) => maintenanceApi.update(id, payload), onSuccess: invalidate }),
    deleteMutation: useMutation({ mutationFn: (id: Id) => maintenanceApi.delete(id), onSuccess: invalidate }),
    assignMutation: useMutation({ mutationFn: ({ id, payload }: { id: Id; payload: Assignment }) => maintenanceApi.assign(Number(id), payload), onSuccess: invalidate }),
    transitionMutation: useMutation({ mutationFn: ({ id, payload }: { id: Id; payload: MaintenanceTransition }) => maintenanceApi.transition(Number(id), payload), onSuccess: invalidate }),
  };
}
