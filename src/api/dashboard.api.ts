import { apiClient } from "@/api/client";
import type { UnknownRecord } from "@/types/api";

export const dashboardApi = {
  summary() {
    return apiClient.get<UnknownRecord>("/dashboard/summary").then((response) => response.data);
  },
  occupancyReport() {
    return apiClient.get<UnknownRecord>("/dashboard/occupancy-report").then((response) => response.data);
  },
  overduePaymentsReport() {
    return apiClient.get<UnknownRecord>("/dashboard/overdue-payments-report").then((response) => response.data);
  },
};
