import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Download, Filter, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { normalizeApiError } from "@/api/errors";
import { ownersApi } from "@/api/owners.api";
import { propertiesApi } from "@/api/properties.api";
import { tenantsApi } from "@/api/tenants.api";
import { vendorsApi } from "@/api/vendors.api";
import { Can } from "@/app/guards/Can";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Pagination } from "@/components/tables/Pagination";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import {
  ContractStatusBadge,
  MaintenancePriorityBadge,
  MaintenanceStatusBadge,
  PaymentStatusBadge,
} from "@/components/ui/StatusBadge";
import { ReportChart } from "@/features/reports/ReportChart";
import { fieldLabels, reportConfig } from "@/features/reports/reportConfig";
import { useReport, useReportExport } from "@/features/reports/useReports";
import { formatCurrency, formatDate, formatNumber, formatPercent } from "@/lib/format";
import { formatDisplayText } from "@/lib/display";
import { contractStatusLabels, maintenanceStatusLabels, paymentStatusLabels } from "@/lib/labels";
import { writePageParams, readPageParams } from "@/lib/pagination";
import { queryKeys } from "@/lib/queryKeys";
import type { PageSize, UnknownRecord } from "@/types/api";
import type { ReportKind, ReportParams } from "@/types/domain";
import {
  contractStatuses,
  maintenanceStatuses,
  paymentStatuses,
  type ContractStatus,
  type MaintenancePriority,
  type MaintenanceStatus,
  type PaymentStatus,
} from "@/types/resources";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type FlatRow = Record<string, JsonValue>;

function isRecord(value: unknown): value is FlatRow {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function reportRows(data: UnknownRecord | undefined): FlatRow[] {
  return Array.isArray(data?.rows) ? data.rows.filter(isRecord) : [];
}

function chartRows(data: UnknownRecord | undefined): Array<Record<string, string | number | null>> {
  return Array.isArray(data?.chart)
    ? data.chart.filter(isRecord).map((row) => Object.fromEntries(
        Object.entries(row).filter((entry): entry is [string, string | number | null] =>
          entry[1] === null || typeof entry[1] === "string" || typeof entry[1] === "number",
        ),
      ))
    : [];
}

function summaryEntries(kind: ReportKind, data: UnknownRecord | undefined): Array<[string, JsonValue]> {
  if (!isRecord(data?.summary)) return [];
  if (kind === "outstanding") {
    const preferred = ["total_outstanding", "overdue_count", "affected_tenants", "total_due"];
    return preferred.filter((key) => data.summary && isRecord(data.summary) && key in data.summary).map((key) => [key, (data.summary as FlatRow)[key]]);
  }
  return Object.entries(data.summary).slice(0, 6);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function displayValue(kind: ReportKind, key: string, value: JsonValue, row?: FlatRow): ReactNode {
  if (value === null || value === "") return "—";
  if (key === "status" && typeof value === "string") {
    if (kind === "contract-expiries" && contractStatuses.includes(value as ContractStatus)) {
      const endDate = typeof row?.end_date === "string" ? row.end_date : undefined;
      return <ContractStatusBadge endDate={endDate} status={value as ContractStatus} />;
    }
    if (kind === "maintenance-costs" && maintenanceStatuses.includes(value as MaintenanceStatus)) {
      return <MaintenanceStatusBadge status={value as MaintenanceStatus} />;
    }
    if (paymentStatuses.includes(value as PaymentStatus)) {
      return <PaymentStatusBadge status={value as PaymentStatus} />;
    }
  }
  if (key === "priority" && typeof value === "string") {
    return <MaintenancePriorityBadge priority={value as MaintenancePriority} />;
  }
  if (key === "days_overdue" && typeof value === "number") {
    return <Badge variant={value > 0 ? "danger" : "muted"}>{value > 0 ? `متأخر ${formatNumber(value)} يومًا` : "ضمن الموعد"}</Badge>;
  }
  if (key === "days_remaining" && typeof value === "number") {
    const variant = value <= 30 ? "danger" : value <= 60 ? "warning" : "muted";
    return <Badge variant={variant}>{value < 0 ? `منتهي منذ ${formatNumber(Math.abs(value))} يومًا` : `${formatNumber(value)} يومًا`}</Badge>;
  }
  if (typeof value === "number") {
    if (key.includes("rate")) return formatPercent(value);
    if (/(amount|cost|rent|paid|due|balance|total|net|aging)/i.test(key)) return formatCurrency(value);
    return formatNumber(value, Number.isInteger(value) ? 0 : 1);
  }
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return formatDate(value);
    if (/^-?\d+(\.\d+)?$/.test(value) && /(amount|cost|rent|paid|due|balance|total|net|aging)/i.test(key)) {
      return formatCurrency(Number(value));
    }
    return formatDisplayText(value) ?? value;
  }
  return Array.isArray(value) ? `${formatNumber(value.length)} عناصر` : "بيانات";
}

function rowLink(kind: ReportKind, row: FlatRow): string | null {
  if (typeof row.payment_id === "number") return `/payments/${row.payment_id}`;
  if (typeof row.request_id === "number") return `/maintenance/${row.request_id}`;
  if (typeof row.contract_id === "number" && kind !== "tenant-payments") return `/contracts/${row.contract_id}`;
  if (typeof row.property_id === "number") return `/properties/${row.property_id}`;
  if (typeof row.owner_id === "number") return `/owners/${row.owner_id}`;
  if (typeof row.tenant_id === "number") return `/tenants/${row.tenant_id}`;
  return null;
}

function rowId(row: FlatRow, index: number): string | number {
  for (const key of ["payment_id", "contract_id", "request_id", "property_id", "owner_id", "tenant_id"]) {
    const value = row[key];
    if (typeof value === "string" || typeof value === "number") return value;
  }
  return index;
}

const paymentStatusOptions = paymentStatuses.map((value) => ({ value, label: paymentStatusLabels[value] }));
const contractStatusOptions = contractStatuses.map((value) => ({ value, label: contractStatusLabels[value] }));
const maintenanceStatusOptions = maintenanceStatuses.map((value) => ({ value, label: maintenanceStatusLabels[value] }));

export function ReportDetails({ kind }: { kind: ReportKind }) {
  const config = reportConfig[kind];
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pagination = readPageParams(searchParams);
  const active = {
    dateFrom: searchParams.get("date_from") ?? "",
    dateTo: searchParams.get("date_to") ?? "",
    propertyId: searchParams.get("property_id") ?? "",
    tenantId: searchParams.get("tenant_id") ?? "",
    ownerId: searchParams.get("owner_id") ?? "",
    vendorId: searchParams.get("vendor_id") ?? "",
    status: searchParams.get("status") ?? "",
    sort: searchParams.get("sort") ?? "",
  };
  const [draft, setDraft] = useState(active);
  useEffect(() => {
    setDraft({
      dateFrom: active.dateFrom,
      dateTo: active.dateTo,
      propertyId: active.propertyId,
      tenantId: active.tenantId,
      ownerId: active.ownerId,
      vendorId: active.vendorId,
      status: active.status,
      sort: active.sort,
    });
  }, [active.dateFrom, active.dateTo, active.ownerId, active.propertyId, active.sort, active.status, active.tenantId, active.vendorId]);

  const params: ReportParams = useMemo(() => ({
    date_from: active.dateFrom || null,
    date_to: active.dateTo || null,
    property_id: active.propertyId ? Number(active.propertyId) : null,
    tenant_id: active.tenantId ? Number(active.tenantId) : null,
    owner_id: active.ownerId ? Number(active.ownerId) : null,
    vendor_id: active.vendorId ? Number(active.vendorId) : null,
    status_filter: active.status || null,
    sort: active.sort || null,
    page: pagination.page,
    page_size: pagination.page_size,
  }), [active.dateFrom, active.dateTo, active.ownerId, active.propertyId, active.sort, active.status, active.tenantId, active.vendorId, pagination.page, pagination.page_size]);

  const reportQuery = useReport(kind, params);
  const exportMutation = useReportExport();
  const propertiesQuery = useQuery({ queryKey: [...queryKeys.properties.all, "options"], queryFn: () => propertiesApi.options({ limit: 50 }), enabled: config.filters.includes("property") });
  const tenantsQuery = useQuery({ queryKey: [...queryKeys.resource("tenants").all, "options"], queryFn: () => tenantsApi.options({ limit: 50 }), enabled: config.filters.includes("tenant") });
  const ownersQuery = useQuery({ queryKey: [...queryKeys.resource("owners").all, "options"], queryFn: () => ownersApi.options({ limit: 50 }), enabled: config.filters.includes("owner") });
  const vendorsQuery = useQuery({ queryKey: [...queryKeys.resource("vendors").all, "options"], queryFn: () => vendorsApi.options({ limit: 50 }), enabled: config.filters.includes("vendor") });

  const rows = reportRows(reportQuery.data);
  const summary = summaryEntries(kind, reportQuery.data);
  const chart = chartRows(reportQuery.data);
  const total = Number(reportQuery.data?.total ?? 0);
  const page = Number(reportQuery.data?.page ?? pagination.page);
  const pageSize = Number(reportQuery.data?.page_size ?? pagination.page_size) as PageSize;
  const totalPages = Number(reportQuery.data?.total_pages ?? 0);
  const hasFilters = Object.values(active).some(Boolean);

  const columns: Array<DataTableColumn<FlatRow>> = config.columns
    .filter((key) => rows.some((row) => row[key] !== undefined))
    .map((key) => ({
      id: key,
      header: fieldLabels[key] ?? key,
      cell: (row) => displayValue(kind, key, row[key] ?? null, row),
      numeric: /(amount|cost|rent|balance|rate|days|count|units)/i.test(key),
    }));

  function applyFilters() {
    const next = new URLSearchParams();
    Object.entries(draft).forEach(([key, value]) => {
      if (!value) return;
      const queryKey = {
        dateFrom: "date_from",
        dateTo: "date_to",
        propertyId: "property_id",
        tenantId: "tenant_id",
        ownerId: "owner_id",
        vendorId: "vendor_id",
        status: "status",
        sort: "sort",
      }[key];
      if (queryKey) next.set(queryKey, value);
    });
    if (pagination.page_size !== 10) next.set("page_size", String(pagination.page_size));
    setSearchParams(next);
  }

  function resetFilters() {
    setDraft({ dateFrom: "", dateTo: "", propertyId: "", tenantId: "", ownerId: "", vendorId: "", status: "", sort: "" });
    setSearchParams(new URLSearchParams());
  }

  async function exportReport(format: "xlsx" | "pdf") {
    const filters = { ...params, format };
    delete filters.page;
    delete filters.page_size;
    const blob = await exportMutation.mutateAsync({ kind, params: filters });
    downloadBlob(blob, `${config.shortTitle}.${format === "pdf" ? "pdf" : "xlsx"}`);
  }

  const statusOptions =
    kind === "contract-expiries"
      ? contractStatusOptions
      : kind === "maintenance-costs"
        ? maintenanceStatusOptions
        : paymentStatusOptions;
  const periodLabel =
    active.dateFrom || active.dateTo
      ? `الفترة: ${active.dateFrom ? formatDate(active.dateFrom) : "البداية"} إلى ${active.dateTo ? formatDate(active.dateTo) : "اليوم"}`
      : "الفترة: جميع التواريخ";

  return (
    <PageContainer>
      <div>
        <Button asChild size="sm" variant="ghost"><Link to="/reports"><ArrowRight aria-hidden="true" className="size-4" />كل التقارير</Link></Button>
        <PageHeader eyebrow="التقارير" title={config.title} description={config.description} />
        <p className="-mt-3 text-meta">{periodLabel}</p>
      </div>

      <section className="rounded-lg border border-border bg-card p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {config.filters.includes("date") ? <>
            <label className="space-y-1.5"><span className="text-meta">من تاريخ</span><Input type="date" value={draft.dateFrom} onChange={(event) => setDraft((current) => ({ ...current, dateFrom: event.target.value }))} /></label>
            <label className="space-y-1.5"><span className="text-meta">إلى تاريخ</span><Input type="date" value={draft.dateTo} onChange={(event) => setDraft((current) => ({ ...current, dateTo: event.target.value }))} /></label>
          </> : null}
          {config.filters.includes("property") ? <FilterSelect label="العقار" value={draft.propertyId} options={propertiesQuery.data ?? []} onChange={(propertyId) => setDraft((current) => ({ ...current, propertyId }))} /> : null}
          {config.filters.includes("tenant") ? <FilterSelect label="المستأجر" value={draft.tenantId} options={tenantsQuery.data ?? []} onChange={(tenantId) => setDraft((current) => ({ ...current, tenantId }))} /> : null}
          {config.filters.includes("owner") ? <FilterSelect label="المالك" value={draft.ownerId} options={ownersQuery.data ?? []} onChange={(ownerId) => setDraft((current) => ({ ...current, ownerId }))} /> : null}
          {config.filters.includes("vendor") ? <FilterSelect label="المورد / الفني" value={draft.vendorId} options={vendorsQuery.data ?? []} onChange={(vendorId) => setDraft((current) => ({ ...current, vendorId }))} /> : null}
          {config.filters.includes("status") ? <div className="space-y-1.5"><p className="text-meta">الحالة</p><Select value={draft.status || "all"} onValueChange={(value) => setDraft((current) => ({ ...current, status: value === "all" ? "" : value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">كل الحالات</SelectItem>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div> : null}
          {config.filters.includes("sort") ? <div className="space-y-1.5"><p className="text-meta">الترتيب</p><Select value={draft.sort || "oldest"} onValueChange={(value) => setDraft((current) => ({ ...current, sort: value === "oldest" ? "" : value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="oldest">الأقدم استحقاقًا</SelectItem><SelectItem value="highest-amount">الأعلى مبلغًا</SelectItem></SelectContent></Select></div> : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <Button onClick={applyFilters}><Filter aria-hidden="true" className="size-4" />تطبيق الفلاتر</Button>
          <Button variant="outline" onClick={resetFilters}><RotateCcw aria-hidden="true" className="size-4" />مسح الفلاتر</Button>
          <Can permission="reports.export">
            <Button disabled={exportMutation.isPending} isLoading={exportMutation.isPending} variant="outline" onClick={() => void exportReport("xlsx")}><Download aria-hidden="true" className="size-4" />تصدير Excel</Button>
            <Button disabled={exportMutation.isPending} variant="outline" onClick={() => void exportReport("pdf")}><Download aria-hidden="true" className="size-4" />تصدير PDF</Button>
          </Can>
        </div>
      </section>

      {exportMutation.isError ? <ErrorState compact title="تعذر التصدير" description={normalizeApiError(exportMutation.error).message} /> : null}

      {kind === "outstanding" && isRecord(reportQuery.data?.summary) ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(["aging_1_30", "aging_31_60", "aging_61_90", "aging_90_plus"] as const).map((key) => (
            <Card key={key}>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{fieldLabels[key]}</CardTitle></CardHeader>
              <CardContent><p className="font-numeric text-xl font-bold text-foreground">{displayValue(kind, key, (reportQuery.data?.summary as FlatRow)[key] ?? null)}</p></CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      <section aria-label="مؤشرات التقرير" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {reportQuery.isPending ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-lg border border-border bg-card" />) : summary.map(([key, value]) => (
          <Card key={key}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{fieldLabels[key] ?? key}</CardTitle></CardHeader><CardContent><p className="font-numeric text-xl font-bold text-foreground">{displayValue(kind, key, value)}</p></CardContent></Card>
        ))}
      </section>

      <ReportChart kind={kind} rows={chart} />

      <section aria-labelledby="report-details-title" className="space-y-3">
        <div><h2 id="report-details-title" className="text-section text-foreground">السجلات التفصيلية</h2><p className="mt-1 text-meta">انقر على السجل للانتقال إلى تفاصيله عندما تكون متاحة.</p></div>
        {reportQuery.isError ? <ErrorState title="تعذر تحميل التقرير" description={normalizeApiError(reportQuery.error).message} onRetry={() => void reportQuery.refetch()} /> : rows.length > 0 && columns.length > 0 ? <>
          <div className="hidden md:block"><DataTable columns={columns} data={rows} getRowId={(row) => rowId(row, rows.indexOf(row))} loading={reportQuery.isPending} pagination={{ page, pageSize, total, totalPages, onPageChange: (nextPage) => setSearchParams(writePageParams(searchParams, { page: nextPage })), onPageSizeChange: (page_size) => setSearchParams(writePageParams(searchParams, { page_size })) }} updating={reportQuery.isFetching && !reportQuery.isPending} onRowClick={(row) => { const target = rowLink(kind, row); if (target) navigate(target); }} /></div>
          <div className="grid gap-2 md:hidden">{rows.map((row, index) => { const target = rowLink(kind, row); const content = <div className="grid grid-cols-2 gap-x-3 gap-y-2">{config.columns.filter((key) => row[key] !== undefined).slice(0, 6).map((key) => <div key={key} className="min-w-0"><p className="text-meta">{fieldLabels[key] ?? key}</p><div className="mt-0.5 truncate text-sm font-semibold text-foreground">{displayValue(kind, key, row[key] ?? null, row)}</div></div>)}</div>; return target ? <Link key={target} className="rounded-lg border border-border bg-card p-4 shadow-card" to={target}>{content}</Link> : <div key={index} className="rounded-lg border border-border bg-card p-4 shadow-card">{content}</div>; })}{totalPages > 0 ? <Pagination page={page} pageSize={pageSize} total={total} totalPages={totalPages} isFetching={reportQuery.isFetching && !reportQuery.isPending} onPageChange={(nextPage) => setSearchParams(writePageParams(searchParams, { page: nextPage }))} onPageSizeChange={(page_size) => setSearchParams(writePageParams(searchParams, { page_size }))} /> : null}</div>
        </> : reportQuery.isPending ? <DataTable columns={[{ id: "loading", header: config.shortTitle, cell: () => "" }]} data={[]} getRowId={() => 0} loading /> : <EmptyState compact title={config.empty} description={hasFilters ? "جرّب تعديل الفلاتر أو مسحها لعرض نطاق أوسع." : undefined} action={hasFilters ? <Button size="sm" variant="outline" onClick={resetFilters}>مسح الفلاتر</Button> : undefined} />}
      </section>
    </PageContainer>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<{ id: number; label: string }>; onChange: (value: string) => void }) {
  return <div className="space-y-1.5"><p className="text-meta">{label}</p><Select value={value || "all"} onValueChange={(next) => onChange(next === "all" ? "" : next)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem>{options.map((option) => <SelectItem key={option.id} value={String(option.id)}>{option.label}</SelectItem>)}</SelectContent></Select></div>;
}
