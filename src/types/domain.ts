export type {
  ContractStatus,
  MaintenancePriority,
  MaintenanceStatus,
  PaymentStatus,
} from "@/types/resources";

export type ReportKind = "collections" | "outstanding" | "contract-expiries" | "maintenance-costs";

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
  page?: number;
  page_size?: number;
};
