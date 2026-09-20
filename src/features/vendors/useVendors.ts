import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vendorsApi } from "@/api/vendors.api";
import { listQueryDefaults } from "@/app/providers/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import type { Id, PagedParams } from "@/types/api";
import type { VendorCreate, VendorListParams, VendorUpdate } from "@/types/resources";

const vendorsKeys = queryKeys.resource("vendors");
const maintenanceKeys = queryKeys.resource("maintenance");

export function useVendorsList(params: VendorListParams) {
  return useQuery({ queryKey: vendorsKeys.list(params), queryFn: () => vendorsApi.list(params), ...listQueryDefaults });
}

export function useVendorsPage(params: PagedParams<VendorListParams>) {
  return useQuery({ queryKey: [...vendorsKeys.list(params), "page"], queryFn: () => vendorsApi.page(params), ...listQueryDefaults });
}

export function useVendor(id: Id | undefined) {
  return useQuery({ queryKey: vendorsKeys.detail(id ?? "unknown"), queryFn: () => vendorsApi.get(id as Id), enabled: id !== undefined });
}

export function useVendorMaintenance(id: Id | undefined) {
  return useQuery({ queryKey: [...vendorsKeys.detail(id ?? "unknown"), "maintenance"] as const, queryFn: () => vendorsApi.maintenance(Number(id)), enabled: id !== undefined });
}

export function useVendorStats(id: Id | undefined) {
  return useQuery({ queryKey: [...vendorsKeys.detail(id ?? "unknown"), "stats"] as const, queryFn: () => vendorsApi.stats(Number(id)), enabled: id !== undefined });
}

export function useVendorMutations() {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: vendorsKeys.all });
    await queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.resource("services").all });
  };
  return {
    createMutation: useMutation({ mutationFn: (payload: VendorCreate) => vendorsApi.create(payload), onSuccess: invalidate }),
    updateMutation: useMutation({ mutationFn: ({ id, payload }: { id: Id; payload: VendorUpdate }) => vendorsApi.update(id, payload), onSuccess: invalidate }),
    deleteMutation: useMutation({ mutationFn: (id: Id) => vendorsApi.delete(id), onSuccess: invalidate }),
  };
}
