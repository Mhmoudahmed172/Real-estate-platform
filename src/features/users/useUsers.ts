import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/api/users.api";
import { listQueryDefaults } from "@/app/providers/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import type { Id, PaginationParams } from "@/types/api";
import type { UserCreate, UserUpdate } from "@/types/auth";

const usersKeys = queryKeys.resource("users");

export function useUsersList(params: PaginationParams) {
  return useQuery({ queryKey: usersKeys.list(params), queryFn: () => usersApi.list(params), ...listQueryDefaults });
}

export function useUser(id: Id | undefined) {
  return useQuery({ queryKey: usersKeys.detail(id ?? "unknown"), queryFn: () => usersApi.get(id as Id), enabled: id !== undefined });
}

export function useRolesList() {
  return useQuery({ queryKey: [...usersKeys.all, "roles"] as const, queryFn: () => usersApi.roles() });
}

export function useUserMutations() {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: usersKeys.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
  };

  return {
    createMutation: useMutation({ mutationFn: (payload: UserCreate) => usersApi.create(payload), onSuccess: invalidate }),
    updateMutation: useMutation({ mutationFn: ({ id, payload }: { id: Id; payload: UserUpdate }) => usersApi.update(id, payload), onSuccess: invalidate }),
    deleteMutation: useMutation({ mutationFn: (id: Id) => usersApi.delete(id), onSuccess: invalidate }),
  };
}
