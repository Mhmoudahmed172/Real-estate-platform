import { apiClient } from "@/api/client";
import { createResourceApi } from "@/api/resource.api";
import { parseContractList, parseContractOut, parsePage, parsePaymentList } from "@/lib/parsers";
import type { Id, PagedParams, UnknownRecord } from "@/types/api";
import type { ContractCreate, ContractListParams, ContractRenewal, ContractUpdate } from "@/types/resources";

const resource = createResourceApi<ContractCreate, ContractUpdate, UnknownRecord>("/contracts/");

export const contractsApi = {
  list(params?: ContractListParams) {
    return apiClient.get<unknown>("/contracts/", { params }).then((response) => parseContractList(response.data));
  },
  page(params: PagedParams<ContractListParams>) {
    return apiClient.get<unknown>("/contracts/page", { params }).then((response) => parsePage(response.data, parseContractList));
  },
  get(id: number) {
    return apiClient.get<unknown>(`/contracts/${id}`).then((response) => {
      const contract = parseContractOut(response.data);
      if (!contract) throw new Error("تعذر قراءة بيانات العقد.");
      return contract;
    });
  },
  create(payload: ContractCreate) {
    return resource.create(payload).then((response) => {
      const contract = parseContractOut(response);
      if (!contract) throw new Error("تعذر قراءة بيانات العقد المنشأ.");
      return contract;
    });
  },
  update(id: Id, payload: ContractUpdate) {
    return resource.update(id, payload).then((response) => {
      const contract = parseContractOut(response);
      if (!contract) throw new Error("تعذر قراءة بيانات العقد المحدث.");
      return contract;
    });
  },
  expiring(params?: { days?: number }) {
    return apiClient.get<unknown>("/contracts/expiring", { params }).then((response) => parseContractList(response.data));
  },
  schedulePreview(payload: ContractCreate) {
    return apiClient.post<unknown>("/contracts/schedule-preview", payload).then((response) => parsePaymentList(response.data));
  },
  payments(contractId: number) {
    return apiClient.get<unknown>(`/contracts/${contractId}/payments`).then((response) => parsePaymentList(response.data));
  },
  renew(contractId: number, payload: ContractRenewal) {
    return apiClient.post<unknown>(`/contracts/${contractId}/renew`, payload).then((response) => {
      const contract = parseContractOut(response.data);
      if (!contract) throw new Error("تعذر قراءة بيانات العقد المجدد.");
      return contract;
    });
  },
  cancel(contractId: number) {
    return apiClient.post<unknown>(`/contracts/${contractId}/cancel`).then((response) => {
      const contract = parseContractOut(response.data);
      if (!contract) throw new Error("تعذر قراءة بيانات العقد بعد الإلغاء.");
      return contract;
    });
  },
  terminate(contractId: number) {
    return apiClient.post<unknown>(`/contracts/${contractId}/terminate`).then((response) => {
      const contract = parseContractOut(response.data);
      if (!contract) throw new Error("تعذر قراءة بيانات العقد بعد الإنهاء.");
      return contract;
    });
  },
  financialSummary(contractId: number) {
    return apiClient.get<unknown>(`/contracts/${contractId}/financial-summary`).then((response) => response.data);
  },
};
