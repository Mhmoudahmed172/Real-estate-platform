import type { PaginationParams } from "@/types/api";

export const propertyTypes = ["Building", "Complex", "Villa", "Shop", "Office", "Warehouse", "Other"] as const;
export type PropertyType = (typeof propertyTypes)[number];

export const propertyStatuses = ["Active", "UnderMaintenance", "Inactive"] as const;
export type PropertyStatus = (typeof propertyStatuses)[number];

export const unitStatuses = ["Available", "Rented", "Reserved", "UnderMaintenance"] as const;
export type UnitStatus = (typeof unitStatuses)[number];

export const contractStatuses = ["Active", "Expired", "Renewed", "Cancelled", "Terminated"] as const;
export type ContractStatus = (typeof contractStatuses)[number];

export const paymentStatuses = ["Pending", "Paid", "Partial", "Overdue"] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

export const paymentFrequencies = ["Monthly", "Quarterly", "SemiAnnual", "Annual"] as const;
export type PaymentFrequency = (typeof paymentFrequencies)[number];

export const maintenanceStatuses = ["New", "InProgress", "Completed", "Cancelled"] as const;
export type MaintenanceStatus = (typeof maintenanceStatuses)[number];

export const maintenancePriorities = ["Low", "Medium", "High", "Urgent"] as const;
export type MaintenancePriority = (typeof maintenancePriorities)[number];

export type PropertyOut = {
  id: number;
  name: string;
  property_type: PropertyType;
  address?: string | null;
  city?: string | null;
  floors_count?: number | null;
  owner_id?: number | null;
  notes?: string | null;
  status: PropertyStatus;
  units_count: number;
};

export type PropertyCreate = {
  name: string;
  property_type: PropertyType;
  address?: string | null;
  city?: string | null;
  floors_count?: number | null;
  owner_id?: number | null;
  notes?: string | null;
};

export type PropertyUpdate = {
  name?: string | null;
  property_type?: PropertyType | null;
  address?: string | null;
  city?: string | null;
  floors_count?: number | null;
  status?: PropertyStatus | null;
  owner_id?: number | null;
  notes?: string | null;
};

export type PropertyListParams = PaginationParams & {
  q?: string | null;
  owner_id?: number | null;
  city?: string | null;
  status_filter?: PropertyStatus | null;
};

export type UnitOut = {
  id: number;
  unit_number: string;
  unit_type?: string | null;
  area?: number | null;
  rooms_count?: number | null;
  floor?: number | null;
  rent_value: number;
  property_id: number;
  status: UnitStatus;
};

export type UnitCreate = {
  unit_number: string;
  unit_type?: string | null;
  area?: number | null;
  rooms_count?: number | null;
  floor?: number | null;
  rent_value: number;
  property_id: number;
};

export type UnitUpdate = {
  unit_number?: string | null;
  unit_type?: string | null;
  area?: number | null;
  rooms_count?: number | null;
  floor?: number | null;
  rent_value?: number | null;
  status?: UnitStatus | null;
};

export type UnitListParams = PaginationParams & {
  q?: string | null;
  status_filter?: UnitStatus | null;
  unit_type?: string | null;
  property_id?: number | null;
};

export type OwnerOut = {
  id: number;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  national_id?: string | null;
  notes?: string | null;
};

export type OwnerCreate = {
  full_name: string;
  phone?: string | null;
  email?: string | null;
  national_id?: string | null;
  notes?: string | null;
};

export type OwnerUpdate = {
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  national_id?: string | null;
  notes?: string | null;
};

export type OwnerListParams = PaginationParams & {
  q?: string | null;
};

export type TenantOut = {
  id: number;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  national_id?: string | null;
  notes?: string | null;
};

export type TenantCreate = {
  full_name: string;
  phone?: string | null;
  email?: string | null;
  national_id?: string | null;
  notes?: string | null;
};

export type TenantUpdate = {
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  national_id?: string | null;
  notes?: string | null;
};

export type TenantListParams = PaginationParams & {
  q?: string | null;
};

export type ContractOut = {
  id: number;
  property_id: number;
  unit_id: number;
  owner_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  rent_value: string;
  payment_frequency?: PaymentFrequency;
  deposit_amount?: string;
  terms?: string | null;
  status: ContractStatus;
  renewed_from_id?: number | null;
};


export type ContractCreate = {
  property_id: number;
  unit_id: number;
  owner_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  rent_value: number | string;
  payment_frequency?: PaymentFrequency;
  deposit_amount?: number | string;
  terms?: string | null;
};

export type ContractUpdate = {
  end_date?: string | null;
  rent_value?: number | string | null;
  status?: ContractStatus | null;
  terms?: string | null;
};

export type ContractRenewal = {
  start_date: string;
  end_date: string;
  rent_value: number | string;
};

export type ContractListParams = PaginationParams & {
  property_id?: number | null;
  tenant_id?: number | null;
  owner_id?: number | null;
  status_filter?: ContractStatus | null;
};

export type PaymentRecord = {
  amount_paid: number | string;
  paid_date?: string | null;
  discount?: number | string | null;
  penalty?: number | string | null;
  receipt_number?: string | null;
};

export type PaymentAdjustment = {
  discount?: number | string;
  penalty?: number | string;
  reason: string;
};
export type MaintenanceOut = {
  id: number;
  issue_type: string;
  status: MaintenanceStatus;
  cost: number;
  property_id?: number | null;
  unit_id?: number | null;
  priority?: MaintenancePriority;
  description?: string | null;
  vendor_id?: number | null;
  execution_date?: string | null;
};

export type MaintenanceListParams = PaginationParams & {
  property_id?: number | null;
  status_filter?: MaintenanceStatus | null;
};


export type MaintenanceCreate = {
  property_id?: number | null;
  unit_id?: number | null;
  issue_type: string;
  priority?: MaintenancePriority;
  description?: string | null;
  vendor_id?: number | null;
};

export type MaintenanceUpdate = {
  priority?: MaintenancePriority | null;
  description?: string | null;
  vendor_id?: number | null;
  status?: MaintenanceStatus | null;
  cost?: number | null;
  execution_date?: string | null;
};

export type MaintenanceTransition = {
  status: MaintenanceStatus;
  note?: string;
  cost?: number | string | null;
  execution_date?: string | null;
};

export type Assignment = {
  vendor_id: number;
};

export type ServiceOut = {
  id: number;
  property_id: number;
  service_name: string;
  provider_id?: number | null;
  cost?: number | null;
  due_date?: string | null;
};

export type ServiceCreate = {
  property_id: number;
  service_name: string;
  provider_id?: number | null;
  cost?: number | null;
  due_date?: string | null;
};

export type ServiceUpdate = {
  service_name?: string | null;
  provider_id?: number | null;
  cost?: number | null;
  due_date?: string | null;
};

export type ServiceListParams = PaginationParams & {
  property_id?: number | null;
};

export type VendorOut = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  services_provided?: string | null;
  notes?: string | null;
};

export type VendorCreate = {
  name: string;
  phone?: string | null;
  email?: string | null;
  services_provided?: string | null;
  notes?: string | null;
};

export type VendorUpdate = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  services_provided?: string | null;
  notes?: string | null;
};

export type VendorListParams = PaginationParams & {
  q?: string | null;
};
export type PaymentOut = {
  id: number;
  contract_id: number;
  due_date: string;
  amount_due: string;
  amount_paid: string;
  status: PaymentStatus;
  paid_date?: string | null;
  discount: string;
  penalty: string;
  receipt_number?: string | null;
};

export type PaymentListParams = PaginationParams & {
  contract_id?: number | null;
  status_filter?: PaymentStatus | null;
  due_from?: string | null;
  due_to?: string | null;
};


