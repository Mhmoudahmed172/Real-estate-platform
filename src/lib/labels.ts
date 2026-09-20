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
  Expired: "منتهي",
  Renewed: "مجدد",
  Cancelled: "مُلغى",
  Terminated: "مُنهى مبكرًا",
};

export const CONTRACT_EXPIRING_SOON_LABEL = "قريب الانتهاء";
export const CONTRACT_EXPIRING_SOON_DAYS = 30;

export function isContractExpiringSoon(status: ContractStatus, endDate?: string | null) {
  if (status !== "Active" || !endDate) return false;
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(end.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((end.getTime() - today.getTime()) / 86_400_000);
  return diffDays >= 0 && diffDays <= CONTRACT_EXPIRING_SOON_DAYS;
}

export function contractDisplayLabel(status: ContractStatus, endDate?: string | null) {
  if (isContractExpiringSoon(status, endDate)) return CONTRACT_EXPIRING_SOON_LABEL;
  return contractStatusLabels[status];
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  Pending: "قيد الانتظار",
  Paid: "مدفوع",
  Partial: "مدفوع جزئيًا",
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
  Cancelled: "مُلغى",
};

export const maintenancePriorityLabels: Record<MaintenancePriority, string> = {
  Low: "منخفض",
  Medium: "متوسط",
  High: "مرتفع",
  Urgent: "عاجل",
};

export const roleLabels: Record<string, string> = {
  Admin: "مدير النظام",
  "Super Admin": "مدير عام",
  superuser: "مدير عام",
  "Property Manager": "مدير العقارات",
  Accountant: "محاسب",
  "Maintenance Manager": "مدير الصيانة",
  Viewer: "مشاهد",
};

export function roleDisplayLabel(name: string | null | undefined, isSuperuser = false) {
  if (isSuperuser) return roleLabels.superuser;
  if (!name) return "حساب";
  return roleLabels[name] ?? name;
}
