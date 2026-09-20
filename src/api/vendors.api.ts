import { apiClient } from "@/api/client";
import { createResourceApi } from "@/api/resource.api";
import { parseMaintenanceList, parsePage, parseVendorList, parseVendorOut, parseVendorStats } from "@/lib/parsers";
import type { Id, PagedParams, SelectOption } from "@/types/api";
import type { VendorCreate, VendorListParams, VendorUpdate } from "@/types/resources";

const resource = createResourceApi<unknown, VendorCreate, VendorUpdate>("/vendors/");

function parseOne(value: unknown) {
  const vendor = parseVendorOut(value);
  if (!vendor) throw new Error("تعذر قراءة بيانات المورد.");
  return vendor;
}

export const vendorsApi = {
  list(params?: VendorListParams) {
    return apiClient.get<unknown>("/vendors/", { params }).then((response) => parseVendorList(response.data));
  },
  page(params: PagedParams<VendorListParams>) {
    return apiClient.get<unknown>("/vendors/page", { params }).then((response) => parsePage(response.data, parseVendorList));
  },
  options(params?: { search?: string; limit?: number }) {
    return apiClient.get<SelectOption[]>("/vendors/options", { params }).then((response) => response.data);
  },
  get(id: Id) {
    return apiClient.get<unknown>(`/vendors/${id}`).then((response) => parseOne(response.data));
  },
  create(payload: VendorCreate) {
    return resource.create(payload).then(parseOne);
  },
  update(id: Id, payload: VendorUpdate) {
    return resource.update(id, payload).then(parseOne);
  },
  delete(id: Id) {
    return resource.delete(id);
  },
  maintenance(vendorId: number) {
    return apiClient.get<unknown>(`/vendors/${vendorId}/maintenance`).then((response) => parseMaintenanceList(response.data));
  },
  stats(vendorId: number) {
    return apiClient.get<unknown>(`/vendors/${vendorId}/stats`).then((response) => {
      const stats = parseVendorStats(response.data);
      if (!stats) throw new Error("تعذر قراءة إحصاءات المورد.");
      return stats;
    });
  },
};
