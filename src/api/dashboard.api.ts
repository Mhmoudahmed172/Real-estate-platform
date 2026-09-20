import { apiClient } from "@/api/client";
import type { ContractOut, MaintenanceOut, PropertyOut, PropertyType } from "@/types/resources";

export type DashboardSummaryResponse = {
  year: number;
  properties_count: number;
  units: {
    total: number;
    rented: number;
    available: number;
    reserved: number;
  };
  collected_ytd: number;
  overdue_count: number;
  collections: Array<{ month: number; collected: number }>;
  portfolio: Array<{
    property_type: PropertyType;
    property_count: number;
    units_count: number;
    occupied_units: number;
  }>;
  featured_property: PropertyOut | null;
  expiring_contracts: Array<{
    contract: ContractOut;
    tenant_name: string;
    property_name: string;
    unit_label: string;
  }>;
  open_maintenance: Array<{
    request: MaintenanceOut;
    property_name: string;
  }>;
};

export const dashboardApi = {
  summary() {
    return apiClient.get<DashboardSummaryResponse>("/dashboard/summary").then((response) => response.data);
  },
};
