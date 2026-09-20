import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { propertiesApi } from "@/api/properties.api";
import { servicesApi } from "@/api/services.api";
import { vendorsApi } from "@/api/vendors.api";
import { listQueryDefaults } from "@/app/providers/queryClient";
import { queryKeys } from "@/lib/queryKeys";
import type { Id, PagedParams } from "@/types/api";
import type { ServiceCreate, ServiceListParams, ServiceUpdate } from "@/types/resources";

const servicesKeys = queryKeys.resource("services");
const vendorsKeys = queryKeys.resource("vendors");

export function useServicesList(params: ServiceListParams) {
  return useQuery({ queryKey: servicesKeys.list(params), queryFn: () => servicesApi.list(params), ...listQueryDefaults });
}

export function useServicesPage(params: PagedParams<ServiceListParams>) {
  return useQuery({ queryKey: [...servicesKeys.list(params), "page"], queryFn: () => servicesApi.page(params), ...listQueryDefaults });
}

export function useService(id: Id | undefined) {
  return useQuery({ queryKey: servicesKeys.detail(id ?? "unknown"), queryFn: () => servicesApi.get(id as Id), enabled: id !== undefined });
}

export function useServiceOptions() {
  const propertiesQuery = useQuery({ queryKey: [...queryKeys.properties.all, "options"], queryFn: () => propertiesApi.options({ limit: 50 }) });
  const vendorsQuery = useQuery({ queryKey: [...vendorsKeys.all, "options"], queryFn: () => vendorsApi.options({ limit: 50 }) });
  return { propertiesQuery, vendorsQuery };
}

export function useServiceRelations(service?: { property_id: number; provider_id?: number | null }) {
  const propertyQuery = useQuery({ queryKey: queryKeys.properties.detail(service?.property_id ?? "unknown"), queryFn: () => propertiesApi.get(service?.property_id as number), enabled: typeof service?.property_id === "number" });
  const providerQuery = useQuery({ queryKey: vendorsKeys.detail(service?.provider_id ?? "unknown"), queryFn: () => vendorsApi.get(service?.provider_id as number), enabled: typeof service?.provider_id === "number" });
  return { propertyQuery, providerQuery };
}

export function useServiceMutations() {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.workspace });
  };
  return {
    createMutation: useMutation({ mutationFn: (payload: ServiceCreate) => servicesApi.create(payload), onSuccess: invalidate }),
    updateMutation: useMutation({ mutationFn: ({ id, payload }: { id: Id; payload: ServiceUpdate }) => servicesApi.update(id, payload), onSuccess: invalidate }),
    deleteMutation: useMutation({ mutationFn: (id: Id) => servicesApi.delete(id), onSuccess: invalidate }),
  };
}
