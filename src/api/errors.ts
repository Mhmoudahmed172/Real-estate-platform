import axios from "axios";
import { isRecord } from "@/lib/guards";
import type { NormalizedApiError, ValidationErrorResponse } from "@/types/api";

const conflictMessages: Record<string, string> = {
  "Owner has properties and cannot be deleted": "لا يمكن حذف هذا المالك لأنه مرتبط بعقارات.",
  "Owner has contracts and cannot be deleted": "لا يمكن حذف هذا المالك لوجود عقود مرتبطة به.",
  "Property has units and cannot be deleted": "لا يمكن حذف هذا العقار لأنه يحتوي على وحدات.",
  "Property has contracts and cannot be deleted": "لا يمكن حذف هذا العقار لوجود عقود مرتبطة به.",
  "Property has maintenance requests and cannot be deleted": "لا يمكن حذف هذا العقار لوجود بلاغات صيانة مرتبطة به.",
  "Unit has contracts and cannot be deleted": "لا يمكن حذف هذه الوحدة لوجود عقود مرتبطة بها.",
  "Unit has maintenance requests and cannot be deleted": "لا يمكن حذف هذه الوحدة لوجود بلاغات صيانة مرتبطة بها.",
  "Unit has an active contract and cannot be marked Available": "لا يمكن جعل الوحدة شاغرة لوجود عقد سارٍ عليها.",
  "Tenant has contracts and cannot be deleted": "لا يمكن حذف هذا المستأجر لوجود عقود مرتبطة به.",
  "Vendor is referenced and cannot be deleted": "لا يمكن حذف هذا المورد لأنه مرتبط بسجلات أخرى.",
  "Maintenance request has history and cannot be deleted": "لا يمكن حذف هذا البلاغ لوجود سجل إجراءات عليه.",
  "Cannot delete your own account": "لا يمكنك حذف حسابك الحالي.",
  "Cannot delete the last superuser": "لا يمكن حذف آخر مدير نظام.",
  "Cannot delete the last system administrator": "لا يمكن حذف آخر مدير للنظام.",
  "Cannot deactivate the last superuser": "لا يمكن تعطيل آخر مدير نظام.",
  "Cannot deactivate the last system administrator": "لا يمكن تعطيل آخر مدير للنظام.",
  "Cannot remove the last superuser": "لا يمكن إزالة صلاحية آخر مدير نظام.",
  "Cannot remove your own superuser status": "لا يمكنك إزالة صلاحية مدير النظام عن حسابك.",
  "Duplicate idempotency key": "تم تنفيذ هذا الطلب مسبقًا.",
  "Payment would overpay amount due": "لا يمكن تسجيل مبلغ يتجاوز المستحق.",
  "Discount exceeds payment amount": "قيمة الخصم تتجاوز مبلغ الدفعة.",
  "Adjustment would overpay amount due": "لا يمكن تطبيق تسوية تجعل المدفوع أكبر من المستحق.",
};

function mapValidationErrors(data: unknown): Record<string, string> | undefined {
  const detail = (data as ValidationErrorResponse | undefined)?.detail;
  if (!Array.isArray(detail)) return undefined;

  return detail.reduce<Record<string, string>>((acc, issue) => {
    const path = issue.loc.filter((part) => part !== "body").join(".");
    if (path) acc[path] = issue.msg;
    return acc;
  }, {});
}

function extractDetailMessage(data: unknown) {
  if (!isRecord(data)) return null;
  if (typeof data.detail === "string" && data.detail.trim()) return data.detail.trim();
  if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
  return null;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (!axios.isAxiosError(error)) {
    return {
      kind: "unknown",
      message: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
      raw: error,
    };
  }

  if (error.code === "ECONNABORTED") {
    return { kind: "timeout", message: "انتهت مهلة الاتصال بالخادم.", raw: error };
  }

  if (!error.response) {
    return { kind: "network", message: "تعذر الاتصال بالخادم. تحقق من الشبكة.", raw: error };
  }

  const status = error.response.status;
  const fieldErrors = status === 422 ? mapValidationErrors(error.response.data) : undefined;
  const detail = extractDetailMessage(error.response.data);

  const messages: Record<number, NormalizedApiError["kind"]> = {
    400: "bad-request",
    401: "unauthorized",
    403: "forbidden",
    404: "not-found",
    409: "conflict",
    422: "validation",
  };

  const conflictMessage = status === 409 ? (detail ? (conflictMessages[detail] ?? "لا يمكن حذف هذا السجل لأنه مرتبط ببيانات أخرى.") : "لا يمكن حذف هذا السجل لأنه مرتبط ببيانات أخرى.") : null;

  return {
    kind: messages[status] ?? (status >= 500 ? "server" : "unknown"),
    status,
    fieldErrors,
    message:
      status === 401
        ? "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى."
        : status === 403
          ? "ليست لديك صلاحية لتنفيذ هذا الإجراء."
          : status === 404
            ? "لم يتم العثور على السجل المطلوب."
            : status === 409
              ? conflictMessage ?? "تعذر تنفيذ الطلب."
              : status === 422
                ? "توجد حقول تحتاج إلى مراجعة."
                : status >= 500
                  ? "حدث خطأ في الخادم. يرجى المحاولة لاحقاً."
                  : detail && !/\/[a-z0-9_{}]+/i.test(detail)
                    ? detail
                    : "تعذر تنفيذ الطلب.",
    raw: error,
  };
}

export function getApiErrorMessage(error: unknown) {
  return normalizeApiError(error);
}

export function isForbiddenError(error: unknown) {
  return normalizeApiError(error).kind === "forbidden";
}
