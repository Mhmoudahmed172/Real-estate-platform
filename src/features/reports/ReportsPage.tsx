import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Download, Filter, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { normalizeApiError } from "@/api/errors";
import { propertiesApi } from "@/api/properties.api";
import { Can } from "@/app/guards/Can";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useReport, useReportExport } from "@/features/reports/useReports";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { pageMotion } from "@/lib/motion";
import { readPageParams, writePageParams } from "@/lib/pagination";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import type { UnknownRecord } from "@/types/api";
import type { ReportKind, ReportParams } from "@/types/domain";

const reportKinds = ["collections", "outstanding", "contract-expiries", "maintenance-costs"] as const satisfies readonly ReportKind[];

const reportLabels: Record<ReportKind, { title: string; description: string }> = {
  collections: { title: "التحصيل", description: "الدفعات المحصلة ضمن الفترة المحددة" },
  outstanding: { title: "المتأخرات", description: "المبالغ المستحقة وغير المسددة" },
  "contract-expiries": { title: "انتهاء العقود", description: "العقود التي تقترب من تاريخ الانتهاء" },
  "maintenance-costs": { title: "تكاليف الصيانة", description: "تكاليف أعمال الصيانة المنفذة" },
};

const fieldLabels: Record<string, string> = {
  payment_count: "عدد الدفعات",
  total_collected: "إجمالي المحصل",
  total_due: "إجمالي المستحق",
  total_paid: "إجمالي المدفوع",
  total_outstanding: "المتبقي",
  total_discount: "إجمالي الخصومات",
  total_penalty: "إجمالي الغرامات",
  contract_count: "عدد العقود",
  total_rent_value: "إجمالي قيمة الإيجار",
  request_count: "عدد الطلبات",
  total_cost: "إجمالي التكلفة",
  payment_id: "الدفعة",
  contract_id: "العقد",
  property_id: "العقار",
  unit_id: "الوحدة",
  tenant_id: "المستأجر",
  owner_id: "المالك",
  vendor_id: "المورد",
  due_date: "تاريخ الاستحقاق",
  paid_date: "تاريخ الدفع",
  amount_due: "المستحق",
  amount_paid: "المدفوع",
  discount: "الخصم",
  penalty: "الغرامة",
  balance: "المتبقي",
  status: "الحالة",
  receipt_number: "رقم الإيصال",
  start_date: "بداية العقد",
  end_date: "نهاية العقد",
  rent_value: "قيمة الإيجار",
  deposit_amount: "التأمين",
  payment_frequency: "دورية الدفع",
  request_id: "الطلب",
  issue_type: "نوع العطل",
  priority: "الأولوية",
  cost: "التكلفة",
  execution_date: "تاريخ التنفيذ",
};

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type FlatRow = Record<string, JsonValue>;

function isReportKind(value: string | null | undefined): value is ReportKind {
  return Boolean(value && reportKinds.includes(value as ReportKind));
}

function isRecord(value: unknown): value is Record<string, JsonValue> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function valueLabel(key: string, value: JsonValue): string {
  if (value === null) return "—";
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  if (typeof value === "number") return formatNumber(value, Number.isInteger(value) ? 0 : 2);
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return formatDate(value);
    if (/^-?\d+(\.\d+)?$/.test(value) && /(amount|cost|rent|paid|due|balance|total)/i.test(key)) {
      return formatCurrency(Number(value));
    }
    return value;
  }
  return Array.isArray(value) ? `${formatNumber(value.length)} عناصر` : "بيانات مركبة";
}

function reportRows(data: UnknownRecord | undefined): FlatRow[] {
  const rows = data?.rows;
  return Array.isArray(rows) ? rows.filter(isRecord) : [];
}

function summaryEntries(data: UnknownRecord | undefined): Array<[string, JsonValue]> {
  const summary = data?.summary;
  return isRecord(summary) ? Object.entries(summary).slice(0, 4) : [];
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

export function ReportsPage() {
  const routeParams = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedKind = searchParams.get("kind") ?? routeParams.kind;
  const kind: ReportKind = isReportKind(requestedKind) ? requestedKind : "collections";
  const dateFrom = searchParams.get("date_from") ?? "";
  const dateTo = searchParams.get("date_to") ?? "";
  const propertyId = searchParams.get("property_id") ?? "";
  const pagination = readPageParams(searchParams);
  const [draft, setDraft] = useState({ dateFrom, dateTo, propertyId });

  const reportParams: ReportParams = useMemo(() => ({
    date_from: dateFrom || null,
    date_to: dateTo || null,
    property_id: propertyId ? Number(propertyId) : null,
    ...pagination,
  }), [dateFrom, dateTo, pagination.page, pagination.page_size, propertyId]);
  const exportParams: ReportParams = useMemo(() => ({
    date_from: dateFrom || null,
    date_to: dateTo || null,
    property_id: propertyId ? Number(propertyId) : null,
  }), [dateFrom, dateTo, propertyId]);

  const reportQuery = useReport(kind, reportParams);
  const exportMutation = useReportExport();
  const propertiesQuery = useQuery({
    queryKey: [...queryKeys.properties.all, "options"],
    queryFn: () => propertiesApi.options({ limit: 50 }),
  });
  const rows = reportRows(reportQuery.data);
  const summary = summaryEntries(reportQuery.data);
  const rowKeys = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).slice(0, 8);
  const total = Number(reportQuery.data?.total ?? 0);
  const page = Number(reportQuery.data?.page ?? pagination.page);
  const pageSize = Number(reportQuery.data?.page_size ?? pagination.page_size) as typeof pagination.page_size;
  const totalPages = Number(reportQuery.data?.total_pages ?? 0);
  const hasFilters = Boolean(dateFrom || dateTo || propertyId);

  function updateParams(next: Record<string, string | null>) {
    const resolved = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) resolved.set(key, value);
      else resolved.delete(key);
    });
    resolved.delete("page");
    setSearchParams(resolved);
  }

  function applyFilters() {
    updateParams({
      date_from: draft.dateFrom || null,
      date_to: draft.dateTo || null,
      property_id: draft.propertyId || null,
    });
  }

  function resetFilters() {
    setDraft({ dateFrom: "", dateTo: "", propertyId: "" });
    setSearchParams(new URLSearchParams([["kind", kind]]));
  }

  async function exportReport() {
    const result = await exportMutation.mutateAsync({ kind, params: exportParams });
    const extension = result.type.includes("json") ? "json" : result.type.includes("pdf") ? "pdf" : "xlsx";
    downloadBlob(result, `${kind}-report.${extension}`);
  }

  const columns: Array<DataTableColumn<FlatRow>> = rowKeys.map((key) => ({
    id: key,
    header: fieldLabels[key] ?? key.replaceAll("_", " "),
    cell: (row) => valueLabel(key, row[key] ?? null),
    numeric: typeof rows.find((row) => row[key] !== null && row[key] !== undefined)?.[key] === "number",
  }));

  const paginationProps = {
    page,
    pageSize,
    total,
    totalPages,
    onPageChange: (nextPage: number) => setSearchParams(writePageParams(searchParams, { page: nextPage })),
    onPageSizeChange: (page_size: typeof pageSize) => setSearchParams(writePageParams(searchParams, { page_size })),
  };

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <PageHeader
          description="تحليلات مالية وتشغيلية لمحفظتك العقارية"
          eyebrow="التقارير"
          title="التقارير"
        />

        <section aria-label="أنواع التقارير" className="flex gap-1 overflow-x-auto border-b border-border">
          {reportKinds.map((item) => (
            <button
              key={item}
              aria-pressed={item === kind}
              className={cn(
                "min-h-11 shrink-0 border-b-2 border-transparent px-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                item === kind && "border-primary text-primary",
              )}
              type="button"
              onClick={() => updateParams({ kind: item })}
            >
              {reportLabels[item].title}
            </button>
          ))}
        </section>

        <section className="rounded-lg border border-border bg-card p-4 shadow-card">
          <div className="grid gap-3 md:grid-cols-[10rem_10rem_minmax(12rem,1fr)_auto] md:items-end">
            <label className="block space-y-1.5">
              <span className="text-meta">من تاريخ</span>
              <Input type="date" value={draft.dateFrom} onChange={(event) => setDraft((current) => ({ ...current, dateFrom: event.target.value }))} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-meta">إلى تاريخ</span>
              <Input type="date" value={draft.dateTo} onChange={(event) => setDraft((current) => ({ ...current, dateTo: event.target.value }))} />
            </label>
            <div className="space-y-1.5">
              <p className="text-meta">العقار</p>
              <Select value={draft.propertyId || "all"} onValueChange={(value) => setDraft((current) => ({ ...current, propertyId: value === "all" ? "" : value }))}>
                <SelectTrigger><SelectValue placeholder="كل العقارات" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل العقارات</SelectItem>
                  {(propertiesQuery.data ?? []).map((property) => <SelectItem key={property.id} value={String(property.id)}>{property.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={applyFilters}><Filter aria-hidden="true" className="size-4" />تطبيق الفلاتر</Button>
              <Button aria-label="إعادة تعيين الفلاتر" variant="outline" onClick={resetFilters}><RotateCcw aria-hidden="true" className="size-4" />إعادة تعيين</Button>
              <Can permission="reports.export">
                <Button disabled={exportMutation.isPending} isLoading={exportMutation.isPending} variant="outline" onClick={() => void exportReport()}>
                  <Download aria-hidden="true" className="size-4" />تصدير
                </Button>
              </Can>
            </div>
          </div>
        </section>

        {exportMutation.isError ? <ErrorState compact title="تعذر التصدير" description={normalizeApiError(exportMutation.error).message} /> : null}

        {summary.length > 0 ? (
          <section aria-label="ملخص التقرير" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map(([key, value]) => (
              <Card key={key}>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{fieldLabels[key] ?? key.replaceAll("_", " ")}</CardTitle></CardHeader>
                <CardContent><p className="font-numeric text-xl font-bold text-foreground">{valueLabel(key, value)}</p></CardContent>
              </Card>
            ))}
          </section>
        ) : null}

        <section aria-labelledby="report-details-title" className="space-y-3">
          <div>
            <h2 id="report-details-title" className="text-section text-foreground">تفاصيل {reportLabels[kind].title}</h2>
            <p className="mt-1 text-meta">{reportLabels[kind].description}</p>
          </div>
          {reportQuery.isError ? (
            <ErrorState title="تعذر تحميل التقرير" description={normalizeApiError(reportQuery.error).message} onRetry={() => void reportQuery.refetch()} />
          ) : rows.length > 0 && columns.length > 0 ? (
            <DataTable
              columns={columns}
              data={rows}
              getRowId={(row) => String(row.payment_id ?? row.contract_id ?? row.request_id ?? rows.indexOf(row))}
              loading={reportQuery.isPending}
              pagination={paginationProps}
              updating={reportQuery.isFetching && !reportQuery.isPending}
            />
          ) : reportQuery.isPending ? (
            <DataTable columns={[{ id: "loading", header: reportLabels[kind].title, cell: () => "" }]} data={[]} getRowId={() => 0} loading />
          ) : (
            <EmptyState
              compact
              description={hasFilters ? "لا توجد نتائج مطابقة للفلاتر المحددة" : undefined}
              title={hasFilters ? "لا توجد نتائج مطابقة للفلاتر المحددة" : "لا توجد بيانات حتى الآن"}
            />
          )}
        </section>
      </PageContainer>
    </motion.div>
  );
}
