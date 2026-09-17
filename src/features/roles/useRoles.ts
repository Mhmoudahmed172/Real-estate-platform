import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "@/api/roles.api";
import { listQueryDefaults } from "@/app/providers/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import type { Id } from "@/types/api";
import type { RoleCreatePayload, RoleUpdatePayload } from "@/types/rbac";

export function useManagedRolesList() {
  return useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: () => rolesApi.list(),
    ...listQueryDefaults,
  });
}

export function usePermissionsCatalog() {
  return useQuery({
    queryKey: queryKeys.roles.permissions,
    queryFn: () => rolesApi.permissions(),
    staleTime: 10 * 60_000,
  });
}

export function useRoleMutations() {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.resource("users").all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
  };

  return {
    createMutation: useMutation({
      mutationFn: (payload: RoleCreatePayload) => rolesApi.create(payload),
      onSuccess: invalidate,
    }),
    updateMutation: useMutation({
      mutationFn: ({ id, payload }: { id: Id; payload: RoleUpdatePayload }) => rolesApi.update(id, payload),
      onSuccess: invalidate,
    }),
    deleteMutation: useMutation({
      mutationFn: (id: Id) => rolesApi.delete(id),
      onSuccess: invalidate,
    }),
  };
}
