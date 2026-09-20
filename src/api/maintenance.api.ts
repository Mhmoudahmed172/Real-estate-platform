import { apiClient } from "@/api/client";
import { createResourceApi } from "@/api/resource.api";
import { parseMaintenanceList, parseMaintenanceOut, parsePage } from "@/lib/parsers";
import type { Id, PagedParams, UnknownRecord } from "@/types/api";
import type { Assignment, MaintenanceCreate, MaintenanceListParams, MaintenanceTransition, MaintenanceUpdate } from "@/types/resources";

const resource = createResourceApi<unknown, MaintenanceCreate, MaintenanceUpdate>("/maintenance/");

function parseOne(value: unknown) {
  const request = parseMaintenanceOut(value);
  if (!request) throw new Error("تعذر قراءة بلاغ الصيانة.");
  return request;
}

export const maintenanceApi = {
  list(params?: MaintenanceListParams) {
    return apiClient.get<unknown>("/maintenance/", { params }).then((response) => parseMaintenanceList(response.data));
  },
  page(params: PagedParams<MaintenanceListParams>) {
    return apiClient.get<unknown>("/maintenance/page", { params }).then((response) => parsePage(response.data, parseMaintenanceList));
  },
  get(id: number) {
    return apiClient.get<unknown>(`/maintenance/${id}`).then((response) => parseOne(response.data));
  },
  create(payload: MaintenanceCreate) {
    return resource.create(payload).then(parseOne);
  },
  update(id: Id, payload: MaintenanceUpdate) {
    return resource.update(id, payload).then(parseOne);
  },
  delete(id: Id) {
    return resource.delete(id);
  },
  assign(requestId: number, payload: Assignment) {
    return apiClient.post<unknown>(`/maintenance/${requestId}/assign`, payload).then((response) => parseOne(response.data));
  },
  transition(requestId: number, payload: MaintenanceTransition) {
    return apiClient.post<unknown>(`/maintenance/${requestId}/status`, payload).then((response) => parseOne(response.data));
  },
  history(requestId: number) {
    return apiClient.get<UnknownRecord[]>(`/maintenance/${requestId}/history`).then((response) => response.data);
  },
};
