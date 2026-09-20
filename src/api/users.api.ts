import { apiClient } from "@/api/client";
import type { Id, PageParams, PageResponse, PaginationParams, UnknownRecord } from "@/types/api";
import type { Role, User, UserCreate, UserUpdate } from "@/types/auth";

export const usersApi = {
  list(params?: PaginationParams) {
    return apiClient.get<User[]>("/users/", { params }).then((response) => response.data);
  },
  page(params: PageParams) {
    return apiClient.get<PageResponse<User>>("/users/page", { params }).then((response) => response.data);
  },
  create(payload: UserCreate) {
    return apiClient.post<User>("/users/", payload).then((response) => response.data);
  },
  get(userId: Id) {
    return apiClient.get<User>(`/users/${userId}`).then((response) => response.data);
  },
  update(userId: Id, payload: UserUpdate) {
    return apiClient.put<User>(`/users/${userId}`, payload).then((response) => response.data);
  },
  delete(userId: Id) {
    return apiClient.delete<void>(`/users/${userId}`).then((response) => response.data);
  },
  roles() {
    return apiClient.get<Role[]>("/users/roles").then((response) => response.data);
  },
  linkAccount(userId: Id, payload: UnknownRecord) {
    return apiClient.put<UnknownRecord>(`/users/${userId}/links`, payload).then((response) => response.data);
  },
  issuePasswordReset(userId: Id) {
    return apiClient.post<UnknownRecord>(`/users/${userId}/password-reset-token`).then((response) => response.data);
  },
};

