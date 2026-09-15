import { apiClient } from "@/api/client";
import { createResourceApi } from "@/api/resource.api";
import { parseServiceList, parseServiceOut } from "@/lib/parsers";
import type { Id } from "@/types/api";
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
