/**
 * Adapter boundary for GET /dashboard/summary, /occupancy-report, and /overdue-payments-report.
 * OpenAPI documents these responses as `{}`. This file exists so UI code does not invent field names.
 * Remove or replace when the backend publishes a confirmed response schema.
 */
export type UnmappedDashboardPayload = {
  mapped: false;
  reason: "openapi-empty-schema";
};

export function adaptUnknownDashboardPayload(raw: unknown): UnmappedDashboardPayload {
  void raw;
  return {
    mapped: false,
    reason: "openapi-empty-schema",
  };
}
