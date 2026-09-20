import { apiClient } from "@/api/client";
import { parsePage, parsePaymentList, parsePaymentOut } from "@/lib/parsers";
import type { Id, PagedParams, UnknownRecord } from "@/types/api";
import type { PaymentAdjustment, PaymentListParams, PaymentRecord } from "@/types/resources";

export const paymentsApi = {
  list(params?: PaymentListParams) {
    return apiClient.get<unknown>("/payments/", { params }).then((response) => parsePaymentList(response.data));
  },
  page(params: PagedParams<PaymentListParams>) {
    return apiClient.get<unknown>("/payments/page", { params }).then((response) => parsePage(response.data, parsePaymentList));
  },
  get(paymentId: Id) {
    return apiClient.get<unknown>(`/payments/${paymentId}`).then((response) => {
      const payment = parsePaymentOut(response.data);
      if (!payment) throw new Error("تعذر قراءة بيانات الدفعة.");
      return payment;
    });
  },
  record(paymentId: Id, payload: PaymentRecord, idempotencyKey: string) {
    return apiClient
      .post<unknown>(`/payments/${paymentId}/record`, payload, { headers: { "idempotency-key": idempotencyKey } })
      .then((response) => parsePaymentOut(response.data) ?? response.data);
  },
  transactions(paymentId: Id) {
    return apiClient.get<UnknownRecord[]>(`/payments/${paymentId}/transactions`).then((response) => response.data);
  },
  receipt(paymentId: Id, transactionId: Id) {
    return apiClient
      .get<Blob>(`/payments/${paymentId}/receipts/${transactionId}`, { responseType: "blob" })
      .then((response) => response.data);
  },
  adjust(paymentId: Id, payload: PaymentAdjustment) {
    return apiClient.post<unknown>(`/payments/${paymentId}/adjustments`, payload).then((response) => parsePaymentOut(response.data) ?? response.data);
  },
  adjustments(paymentId: Id) {
    return apiClient.get<UnknownRecord[]>(`/payments/${paymentId}/adjustments`).then((response) => response.data);
  },
};
