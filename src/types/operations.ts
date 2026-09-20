import type { ContractOut, TenantOut, UnitOut } from "@/types/resources";

export type DashboardKpiLink = {
  resource: string;
  query: Record<string, string | number | boolean>;
};

export type DashboardOverdueAging = {
  bucket_1_30: number;
  bucket_31_60: number;
  bucket_61_90: number;
  bucket_90_plus: number;
};

export type DashboardKpis = {
  overdue_total_amount: number;
  overdue_count: number;
  due_this_month_amount: number;
  due_this_month_count: number;
  vacant_over_30_days_count: number;
  expiring_contracts_count: number;
  urgent_open_maintenance_count: number;
  overdue_open_maintenance_count: number;
  expected_due_this_month: number;
  collected_on_dues_this_month: number;
  collected_this_month: number;
  maintenance_cost_this_month: number;
  net_collection_after_maintenance: number;
  overdue_aging: DashboardOverdueAging;
  filters: Record<string, DashboardKpiLink>;
};

export type OwnerFinancialSummary = {
  owner_id: number;
  total_properties: number;
  total_units: number;
  occupied_units: number;
  occupancy_rate: number;
  expected_rent: string;
  collected_rent: string;
  outstanding: string;
  maintenance_expenses: string;
};

export type TenantNextPayment = {
  payment_id: number;
  contract_id: number;
  due_date: string;
  remaining: string;
};

export type TenantFinancialSummary = {
  tenant_id: number;
  current_unit: UnitOut | null;
  active_contract: ContractOut | null;
  remaining_balance: string;
  next_payment: TenantNextPayment | null;
  overdue_payment_count: number;
  maintenance_request_count: number;
};

export type ContractFinancialFields = {
  collection_status?: string | null;
  total_due?: string | null;
  total_paid?: string | null;
  outstanding_amount?: string | null;
  overdue_count?: number | null;
  days_remaining?: number | null;
};

export type UnitOperationalOut = {
  unit: UnitOut;
  current_tenant: TenantOut | null;
  active_contract: ContractOut | null;
  contract_end_date: string | null;
  vacant_since: string | null;
  vacancy_duration_days: number | null;
  maintenance_status: string | null;
  last_rent_value: number;
};

export type VendorStatsOut = {
  vendor_id: number;
  completed_request_count: number;
  total_maintenance_cost: number;
  average_completion_hours: number | null;
};

export type ActivityEntry = {
  event_type: string;
  timestamp: string;
  amount: string | null;
  receipt_reference: string | null;
  actor_user_id: number | null;
  actor_name: string | null;
  description: string | null;
  meta: Record<string, unknown>;
};

export type TimelineEntry = {
  timestamp: string;
  event: string;
  actor_user_id: number | null;
  actor_name: string | null;
  old_value: unknown;
  new_value: unknown;
  meta: Record<string, unknown>;
};

export type AuditEventOut = {
  id: number;
  actor_user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number;
  changes: Record<string, unknown> | null;
  created_at: string;
};
