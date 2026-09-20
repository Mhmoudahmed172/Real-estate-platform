import { apiClient } from "@/api/client";
import { parseContractList, parsePage, parseTenantList, parseTenantOut } from "@/lib/parsers";
import type { Id, PagedParams, SelectOption, UnknownRecord } from "@/types/api";
import type { TenantCreate, TenantListParams, TenantUpdate } from "@/types/resources";

export const tenantsApi = {
  list(params?: TenantListParams) {
    return apiClient.get<unknown>("/tenants/", { params }).then((response) => parseTenantList(response.data));
  },
  page(params: PagedParams<TenantListParams>) {
    return apiClient.get<unknown>("/tenants/page", { params }).then((response) => parsePage(response.data, parseTenantList));
  },
  options(params?: { search?: string; limit?: number }) {
    return apiClient.get<SelectOption[]>("/tenants/options", { params }).then((response) => response.data);
  },
  get(id: number) {
    return apiClient.get<unknown>(`/tenants/${id}`).then((response) => {
      const tenant = parseTenantOut(response.data);
      if (!tenant) throw new Error("تعذر قراءة بيانات المستأجر.");
      return tenant;
    });
  },
  create(payload: TenantCreate) {
    return apiClient.post<unknown>("/tenants/", payload).then((response) => {
      const tenant = parseTenantOut(response.data);
      if (!tenant) throw new Error("تعذر قراءة بيانات المستأجر بعد الإنشاء.");
      return tenant;
    });
  },
  update(id: Id, payload: TenantUpdate) {
    return apiClient.put<unknown>(`/tenants/${id}`, payload).then((response) => {
      const tenant = parseTenantOut(response.data);
      if (!tenant) throw new Error("تعذر قراءة بيانات المستأجر بعد التحديث.");
      return tenant;
    });
  },
  delete(id: Id) {
    return apiClient.delete<void>(`/tenants/${id}`).then((response) => response.data);
  },
  contracts(tenantId: number) {
    return apiClient.get<unknown>(`/tenants/${tenantId}/contracts`).then((response) => parseContractList(response.data));
  },
  statement(tenantId: number) {
    return apiClient.get<UnknownRecord>(`/tenants/${tenantId}/statement`).then((response) => response.data);
  },
  balance(tenantId: number) {
    return apiClient.get<UnknownRecord>(`/tenants/${tenantId}/balance`).then((response) => response.data);
  },
};
