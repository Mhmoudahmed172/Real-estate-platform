import { apiClient } from "@/api/client";
import { createResourceApi } from "@/api/resource.api";
import { parseMaintenanceList, parseVendorList, parseVendorOut } from "@/lib/parsers";
import type { Id } from "@/types/api";
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
};
