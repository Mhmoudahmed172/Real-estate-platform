import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tenantsApi } from "@/api/tenants.api";
import { listQueryDefaults } from "@/app/providers/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import type { Id, PagedParams } from "@/types/api";
import type { TenantCreate, TenantListParams, TenantUpdate } from "@/types/resources";

const tenantsKeys = queryKeys.resource("tenants");

export function useTenantsList(params: TenantListParams) {
  return useQuery({
    queryKey: tenantsKeys.list(params),
    queryFn: () => tenantsApi.list(params),
    ...listQueryDefaults,
  });
}

export function useTenantsPage(params: PagedParams<TenantListParams>) {
  return useQuery({ queryKey: [...tenantsKeys.list(params), "page"], queryFn: () => tenantsApi.page(params), ...listQueryDefaults });
}

export function useTenant(id: Id | undefined) {
  return useQuery({
    queryKey: tenantsKeys.detail(id ?? "unknown"),
    queryFn: () => tenantsApi.get(Number(id)),
    enabled: id !== undefined,
  });
}

export function useTenantContracts(tenantId: number | undefined) {
  return useQuery({
    queryKey: [...tenantsKeys.detail(tenantId ?? "unknown"), "contracts"] as const,
    queryFn: () => tenantsApi.contracts(tenantId as number),
    enabled: typeof tenantId === "number",
  });
}

export function useTenantMutations() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: tenantsKeys.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.workspace });
  };

  const createMutation = useMutation({
    mutationFn: (payload: TenantCreate) => tenantsApi.create(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: Id; payload: TenantUpdate }) => tenantsApi.update(id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: Id) => tenantsApi.delete(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation };
}
