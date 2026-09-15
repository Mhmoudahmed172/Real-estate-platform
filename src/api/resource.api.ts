import { apiClient } from "@/api/client";
import type { Id, PaginationParams } from "@/types/api";

export function createResourceApi<TResource, TCreate, TUpdate>(basePath: string) {
  return {
    list(params?: PaginationParams) {
      return apiClient.get<TResource[]>(basePath, { params }).then((response) => response.data);
    },
    get(id: Id) {
      return apiClient.get<TResource>(`${basePath}${id}`).then((response) => response.data);
    },
    create(payload: TCreate) {
      return apiClient.post<TResource>(basePath, payload).then((response) => response.data);
    },
    update(id: Id, payload: TUpdate) {
      return apiClient.put<TResource>(`${basePath}${id}`, payload).then((response) => response.data);
    },
    delete(id: Id) {
      return apiClient.delete<void>(`${basePath}${id}`).then((response) => response.data);
    },
  };
}
