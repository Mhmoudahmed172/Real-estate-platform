import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contractsApi } from "@/api/contracts.api";
import { ownersApi } from "@/api/owners.api";
import { propertiesApi } from "@/api/properties.api";
import { tenantsApi } from "@/api/tenants.api";
import { unitsApi } from "@/api/units.api";
import { queryKeys } from "@/lib/queryKeys";
import type { Id } from "@/types/api";
import type { ContractCreate, ContractListParams, ContractRenewal, ContractUpdate } from "@/types/resources";

const contractsKeys = queryKeys.resource("contracts");
const paymentsKeys = queryKeys.resource("payments");

export function useContractsList(params: ContractListParams) {
  return useQuery({ queryKey: contractsKeys.list(params), queryFn: () => contractsApi.list(params) });
}

export function useContract(id: Id | undefined) {
  return useQuery({
    queryKey: contractsKeys.detail(id ?? "unknown"),
    queryFn: () => contractsApi.get(Number(id)),
    enabled: id !== undefined,
  });
}

export function useExpiringContracts(days = 30) {
  return useQuery({ queryKey: [...contractsKeys.lists, "expiring", days] as const, queryFn: () => contractsApi.expiring({ days }) });
}

export function useContractPayments(contractId: number | undefined) {
  return useQuery({
    queryKey: [...contractsKeys.detail(contractId ?? "unknown"), "payments"] as const,
    queryFn: () => contractsApi.payments(contractId as number),
    enabled: typeof contractId === "number",
  });
}

export function useContractRelations(contract?: { property_id: number; unit_id: number; owner_id: number; tenant_id: number }) {
  const propertyQuery = useQuery({
    queryKey: queryKeys.properties.detail(contract?.property_id ?? "unknown"),
    queryFn: () => propertiesApi.get(contract?.property_id as number),
    enabled: Boolean(contract?.property_id),
  });
  const unitQuery = useQuery({
    queryKey: queryKeys.resource("units").detail(contract?.unit_id ?? "unknown"),
    queryFn: () => unitsApi.get(contract?.unit_id as number),
    enabled: Boolean(contract?.unit_id),
  });
  const ownerQuery = useQuery({
    queryKey: queryKeys.resource("owners").detail(contract?.owner_id ?? "unknown"),
    queryFn: () => ownersApi.get(contract?.owner_id as number),
    enabled: Boolean(contract?.owner_id),
  });
  const tenantQuery = useQuery({
    queryKey: queryKeys.resource("tenants").detail(contract?.tenant_id ?? "unknown"),
    queryFn: () => tenantsApi.get(contract?.tenant_id as number),
    enabled: Boolean(contract?.tenant_id),
  });
  return { propertyQuery, unitQuery, ownerQuery, tenantQuery };
}

export function useContractOptions() {
  const propertiesQuery = useQuery({ queryKey: queryKeys.properties.list({ limit: 200 }), queryFn: () => propertiesApi.list({ limit: 200 }) });
  const ownersQuery = useQuery({ queryKey: queryKeys.resource("owners").list({ limit: 200 }), queryFn: () => ownersApi.list({ limit: 200 }) });
  const tenantsQuery = useQuery({ queryKey: queryKeys.resource("tenants").list({ limit: 200 }), queryFn: () => tenantsApi.list({ limit: 200 }) });
  return { propertiesQuery, ownersQuery, tenantsQuery };
}

export function useUnitsForProperty(propertyId: number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.properties.units(propertyId ?? "unknown"),
    queryFn: () => propertiesApi.units(propertyId as number),
    enabled: typeof propertyId === "number",
  });
}

export function useContractMutations() {
  const queryClient = useQueryClient();
  const invalidateContractWorkspace = async () => {
    await queryClient.invalidateQueries({ queryKey: contractsKeys.all });
    await queryClient.invalidateQueries({ queryKey: paymentsKeys.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.resource("units").all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.workspace });
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overduePayments });
  };

  const createMutation = useMutation({ mutationFn: (payload: ContractCreate) => contractsApi.create(payload), onSuccess: invalidateContractWorkspace });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }: { id: Id; payload: ContractUpdate }) => contractsApi.update(id, payload), onSuccess: invalidateContractWorkspace });
  const renewMutation = useMutation({ mutationFn: ({ id, payload }: { id: Id; payload: ContractRenewal }) => contractsApi.renew(Number(id), payload), onSuccess: invalidateContractWorkspace });
  const cancelMutation = useMutation({ mutationFn: (id: Id) => contractsApi.cancel(Number(id)), onSuccess: invalidateContractWorkspace });
  const terminateMutation = useMutation({ mutationFn: (id: Id) => contractsApi.terminate(Number(id)), onSuccess: invalidateContractWorkspace });
  const previewMutation = useMutation({ mutationFn: (payload: ContractCreate) => contractsApi.schedulePreview(payload) });

  return { createMutation, updateMutation, renewMutation, cancelMutation, terminateMutation, previewMutation };
}
