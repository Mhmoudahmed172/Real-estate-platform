import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { propertiesApi } from "@/api/properties.api";
import { unitsApi } from "@/api/units.api";
import { queryKeys } from "@/lib/queryKeys";
import type { Id } from "@/types/api";
import type { UnitCreate, UnitListParams, UnitUpdate } from "@/types/resources";

const unitsKeys = queryKeys.resource("units");

export function useUnitsList(params: UnitListParams) {
  return useQuery({
    queryKey: unitsKeys.list(params),
    queryFn: () => unitsApi.list(params),
  });
}

export function useUnit(id: Id | undefined) {
  return useQuery({
    queryKey: unitsKeys.detail(id ?? "unknown"),
    queryFn: () => unitsApi.get(Number(id)),
    enabled: id !== undefined,
  });
}

export function useUnitProperty(propertyId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.properties.detail(propertyId ?? "unknown"),
    queryFn: () => propertiesApi.get(propertyId as number),
    enabled: typeof propertyId === "number",
  });
}

export function usePropertiesOptions() {
  return useQuery({
    queryKey: queryKeys.properties.list({ limit: 200 }),
    queryFn: () => propertiesApi.list({ limit: 200 }),
  });
}

export function useUnitMutations() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: unitsKeys.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.workspace });
  };

  const createMutation = useMutation({
    mutationFn: (payload: UnitCreate) => unitsApi.create(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: Id; payload: UnitUpdate }) => unitsApi.update(id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: Id) => unitsApi.delete(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation };
}
