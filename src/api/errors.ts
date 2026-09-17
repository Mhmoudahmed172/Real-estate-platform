import axios from "axios";
import type { NormalizedApiError, ValidationErrorResponse } from "@/types/api";

function mapValidationErrors(data: unknown): Record<string, string> | undefined {
  const detail = (data as ValidationErrorResponse | undefined)?.detail;
  if (!Array.isArray(detail)) return undefined;

  return detail.reduce<Record<string, string>>((acc, issue) => {
    const path = issue.loc.filter((part) => part !== "body").join(".");
    if (path) acc[path] = issue.msg;
    return acc;
  }, {});
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

  const messages: Record<number, NormalizedApiError["kind"]> = {
    400: "bad-request",
    401: "unauthorized",
    403: "forbidden",
    404: "not-found",
    409: "conflict",
    422: "validation",
  };

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
            : status === 422
              ? "توجد حقول تحتاج إلى مراجعة."
              : status >= 500
                ? "حدث خطأ في الخادم. يرجى المحاولة لاحقاً."
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
