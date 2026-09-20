import type { Id } from "@/types/api";
import type { ReportKind } from "@/types/domain";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  dashboard: {
    summary: ["dashboard", "summary"] as const,
    occupancy: ["dashboard", "occupancy-report"] as const,
    overduePayments: ["dashboard", "overdue-payments-report"] as const,
    workspace: ["dashboard", "workspace"] as const,
  },
  properties: {
    all: ["properties"] as const,
    lists: ["properties", "list"] as const,
    list: (params?: unknown) => ["properties", "list", params] as const,
    detail: (id: Id) => ["properties", "detail", id] as const,
    units: (id: Id) => ["properties", "units", id] as const,
    summary: (id: Id) => ["properties", "summary", id] as const,
  },
  resource: (resource: string) => ({
    all: [resource] as const,
    lists: [resource, "list"] as const,
    list: (params?: unknown) => [resource, "list", params] as const,
    detail: (id: Id) => [resource, "detail", id] as const,
  }),
  reports: {
    detail: (kind: ReportKind, params?: unknown) => ["reports", kind, params] as const,
  },
  audit: {
    list: (entityType: string, entityId: Id) => ["audit-events", entityType, entityId] as const,
  },
  roles: {
    all: ["roles"] as const,
    list: () => ["roles", "list"] as const,
    permissions: ["roles", "permissions"] as const,
    detail: (id: Id) => ["roles", "detail", id] as const,
  },
};
