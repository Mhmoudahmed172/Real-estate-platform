import { apiClient } from "@/api/client";
import { parsePropertyList, parsePropertyOut, parseUnitList } from "@/lib/parsers";
import type { Id } from "@/types/api";
import type { PropertyCreate, PropertyListParams, PropertyUpdate } from "@/types/resources";

export const propertiesApi = {
  list(params?: PropertyListParams) {
    return apiClient.get<unknown>("/properties/", { params }).then((response) => parsePropertyList(response.data));
  },
  get(id: Id) {
    return apiClient.get<unknown>(`/properties/${id}`).then((response) => {
      const property = parsePropertyOut(response.data);
      if (!property) throw new Error("تعذر قراءة بيانات العقار.");
      return property;
    });
  },
  create(payload: PropertyCreate) {
    return apiClient.post<unknown>("/properties/", payload).then((response) => parsePropertyOut(response.data));
  },
  update(id: Id, payload: PropertyUpdate) {
    return apiClient.put<unknown>(`/properties/${id}`, payload).then((response) => {
      const property = parsePropertyOut(response.data);
      if (!property) throw new Error("تعذر قراءة بيانات العقار بعد التحديث.");
      return property;
    });
  },
  delete(id: Id) {
    return apiClient.delete<void>(`/properties/${id}`).then((response) => response.data);
  },
  summary(propertyId: number) {
    return apiClient.get<unknown>(`/properties/${propertyId}/summary`).then((response) => response.data);
  },
  units(propertyId: number) {
    return apiClient.get<unknown>(`/properties/${propertyId}/units`).then((response) => parseUnitList(response.data));
  },
};
