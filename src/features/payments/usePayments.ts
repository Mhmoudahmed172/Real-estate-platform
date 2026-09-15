import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contractsApi } from "@/api/contracts.api";
import { paymentsApi } from "@/api/payments.api";
import { queryKeys } from "@/lib/queryKeys";
import type { Id } from "@/types/api";
import type { PaymentAdjustment, PaymentListParams, PaymentRecord } from "@/types/resources";

const paymentsKeys = queryKeys.resource("payments");
const contractsKeys = queryKeys.resource("contracts");

function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `payment-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function usePaymentsList(params: PaymentListParams) {
  return useQuery({ queryKey: paymentsKeys.list(params), queryFn: () => paymentsApi.list(params) });
}

export function usePayment(id: Id | undefined) {
  return useQuery({
    queryKey: paymentsKeys.detail(id ?? "unknown"),
    queryFn: () => paymentsApi.get(Number(id)),
    enabled: id !== undefined,
  });
}

export function usePaymentContract(contractId: number | undefined) {
  return useQuery({
    queryKey: contractsKeys.detail(contractId ?? "unknown"),
    queryFn: () => contractsApi.get(contractId as number),
    enabled: typeof contractId === "number",
  });
}

export function usePaymentTransactions(paymentId: Id | undefined) {
  return useQuery({
    queryKey: [...paymentsKeys.detail(paymentId ?? "unknown"), "transactions"] as const,
    queryFn: () => paymentsApi.transactions(paymentId as Id),
    enabled: paymentId !== undefined,
  });
}

export function usePaymentAdjustments(paymentId: Id | undefined) {
  return useQuery({
    queryKey: [...paymentsKeys.detail(paymentId ?? "unknown"), "adjustments"] as const,
    queryFn: () => paymentsApi.adjustments(paymentId as Id),
    enabled: paymentId !== undefined,
  });
}

export function usePaymentMutations(paymentId?: Id, contractId?: Id) {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
    if (paymentId !== undefined) await queryClient.invalidateQueries({ queryKey: paymentsKeys.detail(paymentId) });
    if (contractId !== undefined) await queryClient.invalidateQueries({ queryKey: [...contractsKeys.detail(contractId), "payments"] as const });
    await queryClient.invalidateQueries({ queryKey: contractsKeys.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.workspace });
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overduePayments });
  };

  const recordMutation = useMutation({
    mutationFn: ({ id, payload }: { id: Id; payload: PaymentRecord }) => paymentsApi.record(id, payload, makeIdempotencyKey()),
    onSuccess: invalidate,
  });
  const adjustMutation = useMutation({
    mutationFn: ({ id, payload }: { id: Id; payload: PaymentAdjustment }) => paymentsApi.adjust(id, payload),
    onSuccess: invalidate,
  });

  return { recordMutation, adjustMutation };
}



