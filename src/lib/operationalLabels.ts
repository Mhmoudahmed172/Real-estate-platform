import { formatDemoReference } from "@/lib/display";
import { formatCurrency, formatDate, formatMoney, parseMoney } from "@/lib/format";
import { maintenanceStatusLabels } from "@/lib/labels";
import type { MaintenanceStatus } from "@/types/resources";

export const collectionStatusLabels: Record<string, string> = {
  collected: "محصّل بالكامل",
  overdue: "يوجد متأخرات",
  partial: "محصّل جزئيًا",
  pending: "لم يُحصّل بعد",
};

export const maintenanceEventLabels: Record<string, string> = {
  request_created: "البلاغ تم إنشاؤه",
  vendor_assigned: "تم إسناد المورد",
  status_changed: "تغيرت الحالة",
  cost_updated: "تم تحديث البيانات",
  request_completed: "تم إكمال البلاغ",
};

export const auditActionLabels: Record<string, string> = {
  created: "تم الإنشاء",
  updated: "تم التحديث",
  deleted: "تم الحذف",
  recorded: "تم تسجيل دفعة",
  adjusted: "تمت تسوية",
  assigned: "تم الإسناد",
  transitioned: "تغيرت الحالة",
  cancelled: "تم الإلغاء",
  terminated: "تم الإنهاء",
  renewed: "تم التجديد",
};

export const auditFieldLabels: Record<string, string> = {
  status: "الحالة",
  cost: "التكلفة",
  amount_paid: "المبلغ المدفوع",
  amount_due: "المبلغ المستحق",
  discount: "الخصم",
  penalty: "الغرامة",
  receipt_number: "رقم الإيصال",
  due_date: "تاريخ الاستحقاق",
  paid_date: "تاريخ الدفع",
  execution_date: "تاريخ التنفيذ",
  vendor_id: "المورد",
  priority: "الأولوية",
  issue_type: "نوع البلاغ",
  description: "الوصف",
  rent_value: "قيمة الإيجار",
  end_date: "تاريخ النهاية",
  start_date: "تاريخ البداية",
  terms: "الشروط",
  is_active: "الحالة",
  is_superuser: "صلاحية مدير النظام",
  role_id: "الدور",
  full_name: "الاسم",
  email: "البريد",
  phone: "الهاتف",
  notes: "ملاحظات",
  unit_number: "رقم الوحدة",
  property_id: "العقار",
  tenant_id: "المستأجر",
  owner_id: "المالك",
  contract_id: "العقد",
};

const secretKeys = new Set(["password", "hashed_password", "token", "access_token", "refresh_token", "jwt", "secret", "authorization"]);

export function formatCollectionStatus(value?: string | null) {
  if (!value) return "—";
  return collectionStatusLabels[value] ?? value;
}

export function formatMaintenanceEvent(event: string) {
  return maintenanceEventLabels[event] ?? "تحديث على البلاغ";
}

export function formatAuditAction(action: string) {
  return auditActionLabels[action] ?? action;
}

export function formatMaintenanceStatusValue(value: string | null | undefined) {
  if (!value) return "لا توجد بلاغات مفتوحة";
  return value in maintenanceStatusLabels ? maintenanceStatusLabels[value as MaintenanceStatus] : value;
}

export function paymentActivityTitle(eventType: string, amount: string | null) {
  const money = formatMoney(amount);
  if (eventType === "payment_recorded") {
    return amount ? `تم تسجيل دفعة بقيمة ${money}` : "تم تسجيل دفعة";
  }
  if (eventType === "payment_adjusted") {
    const parsed = parseMoney(amount);
    return parsed ? `تمت تسوية بقيمة ${formatCurrency(parsed)}` : "تمت تسوية مالية";
  }
  return "حركة على الدفعة";
}

export function receiptMeta(reference: string | null | undefined) {
  const display = formatDemoReference(reference);
  return display ? `رقم الإيصال: ${display}` : null;
}

export function actorMeta(name: string | null | undefined) {
  return name ? `بواسطة: ${name}` : null;
}

export function formatAuditValue(key: string, value: unknown): string | null {
  if (secretKeys.has(key.toLowerCase())) return null;
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return formatDate(value);
    if (/^-?\d+(\.\d+)?$/.test(value) && /(amount|cost|rent|paid|due|balance|discount|penalty)/i.test(key)) {
      return formatMoney(value);
    }
    if (value in maintenanceStatusLabels) return maintenanceStatusLabels[value as MaintenanceStatus];
    return formatDemoReference(value) ?? value;
  }
  return null;
}
