import { Badge } from "@/components/ui/Badge";
import {
  contractStatusLabels,
  maintenancePriorityLabels,
  maintenanceStatusLabels,
  paymentStatusLabels,
  propertyStatusLabels,
  unitStatusLabels,
} from "@/lib/labels";
import type {
  ContractStatus,
  MaintenancePriority,
  MaintenanceStatus,
  PaymentStatus,
  PropertyStatus,
  UnitStatus,
} from "@/types/resources";

const propertyVariants: Record<PropertyStatus, "success" | "warning" | "muted"> = {
  Active: "success",
  UnderMaintenance: "warning",
  Inactive: "muted",
};

const unitVariants: Record<UnitStatus, "success" | "default" | "warning" | "muted"> = {
  Available: "default",
  Rented: "success",
  Reserved: "warning",
  UnderMaintenance: "muted",
};

const contractVariants: Record<ContractStatus, "success" | "muted" | "default" | "danger" | "warning"> = {
  Active: "success",
  Expired: "muted",
  Renewed: "default",
  Cancelled: "danger",
  Terminated: "warning",
};

const paymentVariants: Record<PaymentStatus, "success" | "warning" | "danger" | "muted"> = {
  Pending: "warning",
  Paid: "success",
  Partial: "warning",
  Overdue: "danger",
};

const maintenanceStatusVariants: Record<MaintenanceStatus, "default" | "warning" | "success" | "muted"> = {
  New: "default",
  InProgress: "warning",
  Completed: "success",
  Cancelled: "muted",
};

const maintenancePriorityVariants: Record<MaintenancePriority, "muted" | "warning" | "danger"> = {
  Low: "muted",
  Medium: "warning",
  High: "danger",
  Urgent: "danger",
};

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  return <Badge variant={propertyVariants[status]}>{propertyStatusLabels[status]}</Badge>;
}

export function UnitStatusBadge({ status }: { status: UnitStatus }) {
  return <Badge variant={unitVariants[status]}>{unitStatusLabels[status]}</Badge>;
}

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  return <Badge variant={contractVariants[status]}>{contractStatusLabels[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={paymentVariants[status]}>{paymentStatusLabels[status]}</Badge>;
}

export function MaintenanceStatusBadge({ status }: { status: MaintenanceStatus }) {
  return <Badge variant={maintenanceStatusVariants[status]}>{maintenanceStatusLabels[status]}</Badge>;
}

export function MaintenancePriorityBadge({ priority }: { priority: MaintenancePriority }) {
  return <Badge variant={maintenancePriorityVariants[priority]}>{maintenancePriorityLabels[priority]}</Badge>;
}
