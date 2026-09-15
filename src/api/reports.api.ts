import { apiClient } from "@/api/client";
import type { UnknownRecord } from "@/types/api";
import type { ReportKind, ReportParams } from "@/types/domain";

export const reportsApi = {
  get(kind: ReportKind, params?: ReportParams) {
    return apiClient.get<UnknownRecord>(`/reports/${kind}`, { params }).then((response) => response.data);
  },
  export(kind: ReportKind, params?: ReportParams) {
    return apiClient
      .get<Blob>(`/reports/${kind}/export`, { params, responseType: "blob" })
      .then((response) => response.data);
  },
};
