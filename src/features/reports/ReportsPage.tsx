import { motion } from "framer-motion";
import { BarChart3, Download, FileBarChart, Filter } from "lucide-react";
import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { normalizeApiError } from "@/api/errors";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { FilterToolbar } from "@/components/layout/FilterToolbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { usePropertiesList } from "@/features/properties/useProperties";
import { useReport, useReportExport } from "@/features/reports/useReports";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { pageMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { UnknownRecord } from "@/types/api";
import type { ReportKind, ReportParams } from "@/types/domain";

const reportKinds = ["collections", "outstanding", "contract-expiries", "maintenance-costs"] as const satisfies readonly ReportKind[];

const reportLabels: Record<ReportKind, { title: string; description: string }> = {
  collections: { title: "التحصيلات", description: "تقرير التحصيلات ضمن الفترة المحددة." },
  outstanding: { title: "المبالغ القائمة", description: "تقرير الذمم والمدفوعات غير المسددة." },
  "contract-expiries": { title: "انتهاء العقود", description: "العقود التي تنتهي ضمن الفترة المحددة." },
  "maintenance-costs": { title: "تكاليف الصيانة", description: "تكاليف الصيانة حسب معايير التقرير." },
};

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type FlatRow = Record<string, JsonValue>;

function isReportKind(value: string | null | undefined): value is ReportKind {
  return Boolean(value && reportKinds.includes(value as ReportKind));
}

function isRecord(value: unknown): value is Record<string, JsonValue> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function valueLabel(value: JsonValue): string {
  if (value === null) return "—";
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  if (typeof value === "number") return formatNumber(value, Number.isInteger(value) ? 0 : 2);
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return formatDate(value);
    if (/^-?\d+(\.\d+)?$/.test(value) && /(amount|cost|rent|paid|due|balance|total)/i.test(value)) return formatCurrency(Number(value));
    return value;
  }
  if (Array.isArray(value)) return value.length ? `${formatNumber(value.length)} عناصر` : "—";
  return "بيانات مركبة";
}

function normalizeRows(data: UnknownRecord | undefined): FlatRow[] {
  if (!data) return [];
  const candidates = [data.rows, data.items, data.results, data.data, data.records, data.payments, data.contracts, data.maintenance];
  const arrayCandidate = candidates.find(Array.isArray);
  if (arrayCandidate) return arrayCandidate.filter(isRecord);
  if (Array.isArray(data)) return data.filter(isRecord);
  return [];
}

function summaryEntries(data: UnknownRecord | undefined): Array<[string, JsonValue]> {
  if (!data) return [];
  return Object.entries(data).filter(([, value]) => !Array.isArray(value) && (value === null || ["string", "number", "boolean"].includes(typeof value))) as Array<[string, JsonValue]>;
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

  const params: ReportParams = useMemo(() => ({
    date_from: dateFrom || null,
    date_to: dateTo || null,
    property_id: propertyId ? Number(propertyId) : null,
  }), [dateFrom, dateTo, propertyId]);

  const reportQuery = useReport(kind, params);
  const exportMutation = useReportExport();
  const propertiesQuery = usePropertiesList({ skip: 0, limit: 100 });
  const rows = normalizeRows(reportQuery.data);
  const summary = summaryEntries(reportQuery.data);
  const rowKeys = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).slice(0, 8);

  function updateParams(next: Record<string, string | null>) {
    const resolved = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) resolved.set(key, value);
      else resolved.delete(key);
    });
    setSearchParams(resolved);
  }

  async function exportReport() {
    const result = await exportMutation.mutateAsync({ kind, params });
    const extension = result.type.includes("json") ? "json" : result.type.includes("pdf") ? "pdf" : "xlsx";
    downloadBlob(result, `${kind}-report.${extension}`);
  }

  const columns: Array<DataTableColumn<FlatRow>> = rowKeys.map((key) => ({
    id: key,
    header: key.replaceAll("_", " "),
    cell: (row) => valueLabel(row[key] ?? null),
    numeric: typeof rows.find((row) => row[key] !== null && row[key] !== undefined)?.[key] === "number",
  }));

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <PageHeader
          actions={
            <Button className="rounded-full shadow-sm" disabled={exportMutation.isPending} isLoading={exportMutation.isPending} onClick={() => void exportReport()}>
              <Download aria-hidden="true" className="size-4" />
              تصدير
            </Button>
          }
          description="اختيار التقرير، ضبط الفترة والعقار، ثم تصدير النتائج المتاحة من الخادم."
          eyebrow="التقارير"
          title="مركز التقارير"
        />
        <section className="grid gap-3 md:grid-cols-4">
          {reportKinds.map((item) => (
            <button
              key={item}
              className={cn("rounded-xl border border-border bg-card p-4 text-start shadow-card transition-all duration-fast hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", item === kind && "border-primary bg-primary-soft")}
              type="button"
              onClick={() => updateParams({ kind: item })}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <FileBarChart aria-hidden="true" className="size-4" />
              </span>
              <p className="mt-3 font-semibold text-foreground">{reportLabels[item].title}</p>
              <p className="mt-1 text-meta leading-5">{reportLabels[item].description}</p>
            </button>
          ))}
        </section>
        <FilterToolbar className="md:grid-cols-[11rem_11rem_minmax(0,1fr)_auto]">
          <label className="block space-y-1.5">
            <span className="text-meta">من تاريخ</span>
            <Input className="rounded-xl" type="date" value={dateFrom} onChange={(event) => updateParams({ date_from: event.target.value || null })} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-meta">إلى تاريخ</span>
            <Input className="rounded-xl" type="date" value={dateTo} onChange={(event) => updateParams({ date_to: event.target.value || null })} />
          </label>
          <div className="space-y-1.5">
            <p className="text-meta">العقار</p>
            <Select value={propertyId || "all"} onValueChange={(value) => updateParams({ property_id: value === "all" ? null : value })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="كل العقارات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل العقارات</SelectItem>
                {(propertiesQuery.data ?? []).map((property) => (
                  <SelectItem key={property.id} value={String(property.id)}>{property.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="h-11 rounded-xl" variant="outline" onClick={() => setSearchParams(new URLSearchParams([["kind", kind]]))}>
            <Filter aria-hidden="true" className="size-4" />
            مسح التصفية
          </Button>
        </FilterToolbar>
        {exportMutation.isError ? <ErrorState compact title="تعذر التصدير" description={normalizeApiError(exportMutation.error).message} /> : null}
        {summary.length > 0 ? (
          <section className="grid gap-3 md:grid-cols-4">
            {summary.slice(0, 8).map(([label, value]) => (
              <Card key={label}>
                <CardHeader className="pb-2"><CardTitle className="text-sm">{label.replaceAll("_", " ")}</CardTitle></CardHeader>
                <CardContent><p className="font-numeric text-xl font-bold text-foreground">{valueLabel(value)}</p></CardContent>
              </Card>
            ))}
          </section>
        ) : null}
        {reportQuery.isError ? (
          <ErrorState title="تعذر تحميل التقرير" description={normalizeApiError(reportQuery.error).message} onRetry={() => void reportQuery.refetch()} />
        ) : rows.length > 0 && columns.length > 0 ? (
          <DataTable columns={columns} data={rows} getRowId={(_row) => rows.indexOf(_row)} loading={reportQuery.isPending} emptyTitle="لا توجد بيانات" emptyDescription="لم يرجع التقرير صفوفًا قابلة للعرض." />
        ) : reportQuery.isPending ? (
          <DataTable columns={[{ id: "loading", header: reportLabels[kind].title, cell: () => "" }]} data={[]} getRowId={() => 0} loading />
        ) : (
          <EmptyState compact action={<Badge variant="muted">{kind}</Badge>} description="استجاب التقرير بدون صفوف جدولية. إذا كان الخادم يرجع ملخصًا فقط فسيظهر أعلى الصفحة." title="لا توجد صفوف للتقرير" />
        )}
        <section className="rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-2">
            <BarChart3 aria-hidden="true" className="size-4 text-primary" />
            <h2 className="text-section text-foreground">حدود التقارير</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">يعرض المركز أنواع التقارير التي يوفرها الخادم حاليًا. عند رجوع ملخصات أو صفوف غير موثقة، تعرض الواجهة البيانات القابلة للقراءة فقط وتحافظ على بقية التقرير بأمان.</p>
        </section>
      </PageContainer>
    </motion.div>
  );
}







