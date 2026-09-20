import type { DashboardSummaryResponse } from "@/api/dashboard.api";
import type { DashboardViewModel } from "@/features/dashboard/dashboardAdapter";
import { currentYearRangeLabel, formatMonthYear } from "@/lib/format";
import { propertyTypeLabels } from "@/lib/labels";

export function adaptDashboardSummary(summary: DashboardSummaryResponse): DashboardViewModel {
  const occupancyPercent =
    summary.units.total > 0 ? (summary.units.rented / summary.units.total) * 100 : null;

  return {
    periodLabel: currentYearRangeLabel(summary.year),
    snapshotTruncated: false,
    occupancyPercent,
    collectionsMapped: summary.collections.some((point) => point.collected > 0),
    collections: summary.collections.map((point) => ({
      month: formatMonthYear(summary.year, point.month - 1),
      collected: point.collected,
    })),
    portfolio: summary.portfolio.map((segment) => ({
      type: segment.property_type,
      label: propertyTypeLabels[segment.property_type],
      propertyCount: segment.property_count,
      unitsCount: segment.units_count,
      occupiedUnits: segment.occupied_units,
      occupancy:
        segment.units_count > 0 ? (segment.occupied_units / segment.units_count) * 100 : null,
    })),
    featuredProperty: summary.featured_property,
    kpis: [
      {
        id: "properties",
        label: "إجمالي العقارات",
        value: summary.properties_count,
        format: "number",
        mapped: true,
        footer: [
          {
            label: `${summary.units.available} وحدة شاغرة`,
            tone: summary.units.available > 0 ? "warning" : "muted",
          },
          { label: `${summary.units.total} وحدة`, tone: "muted" },
        ],
      },
      {
        id: "occupancy",
        label: "معدل الإشغال",
        value: occupancyPercent,
        format: "percent",
        mapped: occupancyPercent !== null,
        footer: [
          { label: `${summary.units.rented} مؤجرة`, tone: "success" },
          { label: `${summary.units.reserved} محجوزة`, tone: "muted" },
        ],
      },
      {
        id: "rented-units",
        label: "وحدات مؤجرة",
        value: summary.units.rented,
        format: "number",
        mapped: true,
        footer: [
          {
            label:
              occupancyPercent === null ? "لا تتوفر وحدات" : `${Math.round(occupancyPercent)}% من الوحدات`,
            tone: "success",
          },
        ],
      },
      {
        id: "collected",
        label: "الإيرادات المحصلة",
        value: summary.collected_ytd,
        format: "currency",
        mapped: true,
        footer: [
          {
            label: `${summary.overdue_count} متأخرات`,
            tone: summary.overdue_count > 0 ? "danger" : "muted",
          },
          { label: "من دفعات السنة الحالية", tone: "muted" },
        ],
      },
    ],
    expiringContracts: summary.expiring_contracts.map((row) => ({
      contract: row.contract,
      tenantName: row.tenant_name,
      propertyName: row.property_name,
      unitLabel: row.unit_label,
    })),
    openMaintenance: summary.open_maintenance.map((row) => ({
      request: row.request,
      propertyName: row.property_name,
    })),
  };
}
