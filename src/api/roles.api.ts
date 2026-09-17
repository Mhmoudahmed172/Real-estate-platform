import { apiClient } from "@/api/client";
import type { Id } from "@/types/api";
import type { Permission, RoleCreatePayload, RoleDetail, RoleUpdatePayload } from "@/types/rbac";

export const rolesApi = {
  list() {
    return apiClient.get<RoleDetail[]>("/roles/").then((response) => response.data);
  },
  permissions() {
    return apiClient.get<Permission[]>("/roles/permissions").then((response) => response.data);
  },
  get(roleId: Id) {
    return apiClient.get<RoleDetail>(`/roles/${roleId}`).then((response) => response.data);
  },
  create(payload: RoleCreatePayload) {
    return apiClient.post<RoleDetail>("/roles/", payload).then((response) => response.data);
  },
  update(roleId: Id, payload: RoleUpdatePayload) {
    return apiClient.patch<RoleDetail>(`/roles/${roleId}`, payload).then((response) => response.data);
  },
  delete(roleId: Id) {
    return apiClient.delete<void>(`/roles/${roleId}`).then((response) => response.data);
  },
};
