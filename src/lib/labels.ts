import type {
  ContractStatus,
  MaintenancePriority,
  MaintenanceStatus,
  PaymentStatus,
  PropertyStatus,
  PropertyType,
  UnitStatus,
} from "@/types/resources";

export const propertyTypeLabels: Record<PropertyType, string> = {
  Building: "مبنى",
  Complex: "مجمع",
  Villa: "فيلا",
  Shop: "محل",
  Office: "مكتب",
  Warehouse: "مستودع",
  Other: "أخرى",
};

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  Active: "نشط",
  UnderMaintenance: "تحت الصيانة",
  Inactive: "غير نشط",
};

export const unitStatusLabels: Record<UnitStatus, string> = {
  Available: "شاغرة",
  Rented: "مؤجرة",
  Reserved: "محجوزة",
  UnderMaintenance: "تحت الصيانة",
};

export const contractStatusLabels: Record<ContractStatus, string> = {
  Active: "ساري",
  Expired: "منتهٍ",
  Renewed: "مجدد",
  Cancelled: "ملغى",
  Terminated: "منهى",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  Pending: "معلق",
  Paid: "مدفوع",
  Partial: "جزئي",
  Overdue: "متأخر",
};

export const paymentFrequencyLabels = {
  Monthly: "شهري",
  Quarterly: "ربع سنوي",
  SemiAnnual: "نصف سنوي",
  Annual: "سنوي",
} as const;

export const maintenanceStatusLabels: Record<MaintenanceStatus, string> = {
  New: "جديد",
  InProgress: "قيد التنفيذ",
  Completed: "مكتمل",
  Cancelled: "ملغى",
};

export const maintenancePriorityLabels: Record<MaintenancePriority, string> = {
  Low: "منخفض",
  Medium: "متوسط",
  High: "مرتفع",
  Urgent: "عاجل",
};
