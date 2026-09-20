import { apiClient } from "@/api/client";
import { createResourceApi } from "@/api/resource.api";
import { parsePage, parseServiceList, parseServiceOut } from "@/lib/parsers";
import type { Id, PagedParams } from "@/types/api";
import type { ServiceCreate, ServiceListParams, ServiceUpdate } from "@/types/resources";

const resource = createResourceApi<unknown, ServiceCreate, ServiceUpdate>("/services/");

function parseOne(value: unknown) {
  const service = parseServiceOut(value);
  if (!service) throw new Error("تعذر قراءة بيانات الخدمة.");
  return service;
}

export const servicesApi = {
  list(params?: ServiceListParams) {
    return apiClient.get<unknown>("/services/", { params }).then((response) => parseServiceList(response.data));
  },
  page(params: PagedParams<ServiceListParams>) {
    return apiClient.get<unknown>("/services/page", { params }).then((response) => parsePage(response.data, parseServiceList));
  },
  get(id: Id) {
    return apiClient.get<unknown>(`/services/${id}`).then((response) => parseOne(response.data));
  },
  create(payload: ServiceCreate) {
    return resource.create(payload).then(parseOne);
  },
  update(id: Id, payload: ServiceUpdate) {
    return resource.update(id, payload).then(parseOne);
  },
  delete(id: Id) {
    return resource.delete(id);
  },
};
