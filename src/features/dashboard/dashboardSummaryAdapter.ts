import type { DashboardSummaryResponse } from "@/api/dashboard.api";
import type { DashboardKpi, DashboardViewModel } from "@/features/dashboard/dashboardAdapter";
import { currentYearRangeLabel, formatMonthYear, formatNumber } from "@/lib/format";
import { kpiFilterHref } from "@/lib/kpiFilters";
import { propertyTypeLabels } from "@/lib/labels";

export function adaptDashboardSummary(summary: DashboardSummaryResponse): DashboardViewModel {
  const occupancyPercent =
    summary.units.total > 0 ? (summary.units.rented / summary.units.total) * 100 : null;
  const kpis = summary.kpis;
  const filters = kpis?.filters ?? {};

  const primary: DashboardKpi[] = kpis
    ? [
        {
          id: "overdue",
          label: "إجمالي المتأخرات",
          value: kpis.overdue_total_amount,
          format: "currency",
          mapped: true,
          href: kpiFilterHref(filters.overdue_payments),
          footer: [
            { label: `${formatNumber(kpis.overdue_count)} دفعة متأخرة`, tone: kpis.overdue_count > 0 ? "danger" : "muted" },
          ],
        },
        {
          id: "due-this-month",
          label: "المستحق هذا الشهر",
          value: kpis.due_this_month_amount,
          format: "currency",
          mapped: true,
          href: kpiFilterHref(filters.due_this_month),
          footer: [
            { label: `${formatNumber(kpis.due_this_month_count)} استحقاق`, tone: "muted" },
          ],
        },
        {
          id: "vacant-over-30",
          label: "وحدات شاغرة أكثر من 30 يومًا",
          value: kpis.vacant_over_30_days_count,
          format: "number",
          mapped: true,
          href: kpiFilterHref(filters.vacant_over_30_days),
          footer: [
            { label: `${formatNumber(summary.units.available)} وحدة شاغرة`, tone: summary.units.available > 0 ? "warning" : "muted" },
          ],
        },
        {
          id: "expiring",
          label: "عقود قريبة من الانتهاء",
          value: kpis.expiring_contracts_count,
          format: "number",
          mapped: true,
          href: kpiFilterHref(filters.expiring_contracts),
          footer: [{ label: "خلال 30 يومًا", tone: kpis.expiring_contracts_count > 0 ? "warning" : "muted" }],
        },
      ]
    : [];

  const secondary: DashboardKpi[] = kpis
    ? [
        {
          id: "expected-vs-collected",
          label: "المتوقع مقابل المحصل",
          value: kpis.expected_due_this_month,
          format: "currency",
          mapped: true,
          footer: [
            { label: `محصّل ${formatNumber(Math.round(kpis.collected_on_dues_this_month))} ر.س`, tone: "success" },
          ],
        },
        {
          id: "net-collection",
          label: "صافي التحصيل بعد الصيانة",
          value: kpis.net_collection_after_maintenance,
          format: "currency",
          mapped: true,
          footer: [
            { label: `صيانة ${formatNumber(Math.round(kpis.maintenance_cost_this_month))} ر.س`, tone: "warning" },
          ],
        },
        {
          id: "urgent-maintenance",
          label: "البلاغات العاجلة",
          value: kpis.urgent_open_maintenance_count,
          format: "number",
          mapped: true,
          href: kpiFilterHref(filters.urgent_maintenance),
          footer: [{ label: "بلاغات مفتوحة", tone: kpis.urgent_open_maintenance_count > 0 ? "danger" : "muted" }],
        },
        {
          id: "overdue-maintenance",
          label: "البلاغات المتأخرة",
          value: kpis.overdue_open_maintenance_count,
          format: "number",
          mapped: true,
          href: kpiFilterHref(filters.overdue_maintenance),
          footer: [{ label: "تجاوزت موعد التنفيذ", tone: kpis.overdue_open_maintenance_count > 0 ? "warning" : "muted" }],
        },
      ]
    : [];

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
    kpis: primary.length
      ? primary
      : [
          {
            id: "properties",
            label: "إجمالي العقارات",
            value: summary.properties_count,
            format: "number",
            mapped: true,
            footer: [
              { label: `${summary.units.available} وحدة شاغرة`, tone: summary.units.available > 0 ? "warning" : "muted" },
              { label: `${summary.units.total} وحدة`, tone: "muted" },
            ],
          },
        ],
    secondaryKpis: secondary,
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
