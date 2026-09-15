import { apiClient } from "@/api/client";
import { parseContractList, parseOwnerList, parseOwnerOut, parsePropertyList } from "@/lib/parsers";
import type { Id, UnknownRecord } from "@/types/api";
import type { OwnerCreate, OwnerListParams, OwnerUpdate } from "@/types/resources";

export const ownersApi = {
  list(params?: OwnerListParams) {
    return apiClient.get<unknown>("/owners/", { params }).then((response) => parseOwnerList(response.data));
  },
  get(id: number) {
    return apiClient.get<unknown>(`/owners/${id}`).then((response) => {
      const owner = parseOwnerOut(response.data);
      if (!owner) throw new Error("تعذر قراءة بيانات المالك.");
      return owner;
    });
  },
  create(payload: OwnerCreate) {
    return apiClient.post<unknown>("/owners/", payload).then((response) => {
      const owner = parseOwnerOut(response.data);
      if (!owner) throw new Error("تعذر قراءة بيانات المالك بعد الإنشاء.");
      return owner;
    });
  },
  update(id: Id, payload: OwnerUpdate) {
    return apiClient.put<unknown>(`/owners/${id}`, payload).then((response) => {
      const owner = parseOwnerOut(response.data);
      if (!owner) throw new Error("تعذر قراءة بيانات المالك بعد التحديث.");
      return owner;
    });
  },
  delete(id: Id) {
    return apiClient.delete<void>(`/owners/${id}`).then((response) => response.data);
  },
  properties(ownerId: number) {
    return apiClient.get<unknown>(`/owners/${ownerId}/properties`).then((response) => parsePropertyList(response.data));
  },
  contracts(ownerId: number) {
    return apiClient.get<unknown>(`/owners/${ownerId}/contracts`).then((response) => parseContractList(response.data));
  },
  statement(ownerId: number) {
    return apiClient.get<UnknownRecord>(`/owners/${ownerId}/statement`).then((response) => response.data);
  },
  balance(ownerId: number) {
    return apiClient.get<UnknownRecord>(`/owners/${ownerId}/balance`).then((response) => response.data);
  },
};
