import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ownersApi } from "@/api/owners.api";
import { listQueryDefaults } from "@/app/providers/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import type { Id, PagedParams } from "@/types/api";
import type { OwnerCreate, OwnerListParams, OwnerUpdate } from "@/types/resources";

const ownersKeys = queryKeys.resource("owners");

export function useOwnersList(params: OwnerListParams) {
  return useQuery({
    queryKey: ownersKeys.list(params),
    queryFn: () => ownersApi.list(params),
    ...listQueryDefaults,
  });
}

export function useOwnersPage(params: PagedParams<OwnerListParams>) {
  return useQuery({ queryKey: [...ownersKeys.list(params), "page"], queryFn: () => ownersApi.page(params), ...listQueryDefaults });
}

export function useOwner(id: Id | undefined) {
  return useQuery({
    queryKey: ownersKeys.detail(id ?? "unknown"),
    queryFn: () => ownersApi.get(Number(id)),
    enabled: id !== undefined,
  });
}

export function useOwnerProperties(ownerId: number | undefined) {
  return useQuery({
    queryKey: [...ownersKeys.detail(ownerId ?? "unknown"), "properties"] as const,
    queryFn: () => ownersApi.properties(ownerId as number),
    enabled: typeof ownerId === "number",
  });
}

export function useOwnerContracts(ownerId: number | undefined) {
  return useQuery({
    queryKey: [...ownersKeys.detail(ownerId ?? "unknown"), "contracts"] as const,
    queryFn: () => ownersApi.contracts(ownerId as number),
    enabled: typeof ownerId === "number",
  });
}

export function useOwnerMutations() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ownersKeys.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.workspace });
  };

  const createMutation = useMutation({
    mutationFn: (payload: OwnerCreate) => ownersApi.create(payload),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: Id; payload: OwnerUpdate }) => ownersApi.update(id, payload),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: Id) => ownersApi.delete(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation };
}
