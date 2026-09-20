import { apiClient } from "@/api/client";
import type { AuditEventOut } from "@/types/operations";

export const auditApi = {
  list(params: { entity_type: string; entity_id: number; skip?: number; limit?: number }) {
    return apiClient.get<AuditEventOut[]>("/audit-events/", { params }).then((response) => response.data);
  },
};
