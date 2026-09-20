import { apiClient } from "@/api/client";
import { parsePage, parseUnitList, parseUnitOut } from "@/lib/parsers";
import type { Id, PagedParams } from "@/types/api";
import type { AvailabilityParams } from "@/types/domain";
import type { UnitCreate, UnitListParams, UnitOut, UnitUpdate } from "@/types/resources";

export const unitsApi = {
  list(params?: UnitListParams) {
    return apiClient.get<unknown>("/units/", { params }).then((response) => parseUnitList(response.data));
  },
  page(params: PagedParams<UnitListParams>) {
    return apiClient.get<unknown>("/units/page", { params }).then((response) => parsePage(response.data, parseUnitList));
  },
  get(id: number) {
    return apiClient.get<unknown>(`/units/${id}`).then((response) => {
      const unit = parseUnitOut(response.data);
      if (!unit) throw new Error("تعذر قراءة بيانات الوحدة.");
      return unit;
    });
  },
  create(payload: UnitCreate) {
    return apiClient.post<unknown>("/units/", payload).then((response) => {
      const unit = parseUnitOut(response.data);
      if (!unit) throw new Error("تعذر قراءة بيانات الوحدة بعد الإنشاء.");
      return unit;
    });
  },
  update(id: Id, payload: UnitUpdate) {
    return apiClient.put<unknown>(`/units/${id}`, payload).then((response) => {
      const unit = parseUnitOut(response.data);
      if (!unit) throw new Error("تعذر قراءة بيانات الوحدة بعد التحديث.");
      return unit;
    });
  },
  delete(id: Id) {
    return apiClient.delete<void>(`/units/${id}`).then((response) => response.data);
  },
  availability(params: AvailabilityParams) {
    return apiClient.get<UnitOut[]>("/units/availability", { params }).then((response) => parseUnitList(response.data));
  },
};
