import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ownersApi } from "@/api/owners.api";
import { propertiesApi } from "@/api/properties.api";
import { listQueryDefaults } from "@/app/providers/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import type { Id } from "@/types/api";
import type { PropertyCreate, PropertyListParams, PropertyUpdate } from "@/types/resources";

export function usePropertiesList(params: PropertyListParams) {
  return useQuery({
    queryKey: queryKeys.properties.list(params),
    queryFn: () => propertiesApi.list(params),
    ...listQueryDefaults,
  });
}

export function useProperty(id: Id | undefined) {
  return useQuery({
    queryKey: queryKeys.properties.detail(id ?? "unknown"),
    queryFn: () => propertiesApi.get(id as Id),
    enabled: Boolean(id),
  });
}

export function usePropertyUnits(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.properties.units(id ?? "unknown"),
    queryFn: () => propertiesApi.units(id as number),
    enabled: typeof id === "number",
  });
}

export function usePropertyOwner(ownerId: number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.resource("owners").detail(ownerId ?? "unknown"),
    queryFn: () => ownersApi.get(ownerId as number),
    enabled: typeof ownerId === "number",
  });
}

export function useOwnersOptions() {
  return useQuery({
    queryKey: queryKeys.resource("owners").list({ limit: 200 }),
    queryFn: () => ownersApi.list({ limit: 200 }),
    ...listQueryDefaults,
  });
}

export function usePropertyMutations() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.workspace });
    await queryClient.invalidateQueries({ queryKey: queryKeys.resource("units").lists });
  };

  const createMutation = useMutation({
    mutationFn: (payload: PropertyCreate) => propertiesApi.create(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: Id; payload: PropertyUpdate }) => propertiesApi.update(id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: Id) => propertiesApi.delete(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation };
}
