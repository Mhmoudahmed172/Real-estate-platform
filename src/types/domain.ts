export type {
  ContractStatus,
  MaintenancePriority,
  MaintenanceStatus,
  PaymentStatus,
} from "@/types/resources";

export type ReportKind =
  | "collections"
  | "outstanding"
  | "contract-expiries"
  | "occupancy"
  | "maintenance-costs"
  | "property-performance"
  | "owners"
  | "tenant-payments";

export type AvailabilityParams = {
  start_date: string;
  end_date: string;
  property_id?: number | null;
  skip?: number;
  limit?: number;
};

export type ReportParams = {
  date_from?: string | null;
  date_to?: string | null;
  property_id?: number | null;
  tenant_id?: number | null;
  owner_id?: number | null;
  vendor_id?: number | null;
  status_filter?: string | null;
  sort?: string | null;
  page?: number;
  page_size?: number;
  format?: "xlsx" | "pdf" | "json";
};
