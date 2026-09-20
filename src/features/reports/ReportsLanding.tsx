import { useQueries } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, Building2, ClipboardList, FileClock, Receipt, Users, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { reportsApi } from "@/api/reports.api";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { fieldLabels, reportConfig, reportKinds } from "@/features/reports/reportConfig";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { queryKeys } from "@/lib/queryKeys";
import type { UnknownRecord } from "@/types/api";
import type { ReportKind } from "@/types/domain";

const groups = ["التحصيل والمالية", "العقود", "التشغيل", "الإدارة"] as const;

const icons: Record<ReportKind, typeof Receipt> = {
  collections: Receipt,
  outstanding: FileClock,
  "property-performance": BarChart3,
  "contract-expiries": ClipboardList,
  occupancy: Building2,
  "maintenance-costs": Wrench,
  owners: Users,
  "tenant-payments": Users,
};

function summaryOf(data: UnknownRecord | undefined): UnknownRecord {
  const summary = data?.summary;
  return summary && typeof summary === "object" && !Array.isArray(summary)
    ? (summary as UnknownRecord)
    : {};
}

function kpiValue(key: string, value: unknown) {
  if (value === null || value === undefined) return "—";
  if (key.includes("rate")) return formatPercent(Number(value));
  if (/(total|amount|cost|paid|due|outstanding|balance)/i.test(key) && !/(count|units)/i.test(key)) {
    return formatCurrency(Number(value));
  }
  return formatNumber(Number(value));
}

export function ReportsLanding() {
  const queries = useQueries({
    queries: reportKinds.map((kind) => ({
      queryKey: queryKeys.reports.detail(kind, { page: 1, page_size: 10 }),
      queryFn: () => reportsApi.get(kind, { page: 1, page_size: 10 }),
      staleTime: 5 * 60_000,
    })),
  });

  return (
    <PageContainer>
      <PageHeader
        description="تقارير مالية وتشغيلية تفصيلية تساعدك على فهم ما حدث واتخاذ الإجراء المناسب."
        eyebrow="ذكاء المحفظة"
        title="التقارير"
      />
      {groups.map((group) => {
        const items = reportKinds.filter((kind) => reportConfig[kind].group === group);
        return (
          <section key={group} aria-labelledby={`reports-${group}`} className="space-y-3">
            <div>
              <h2 id={`reports-${group}`} className="text-section text-foreground">{group}</h2>
              <div className="mt-2 h-px bg-border" />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((kind) => {
                const config = reportConfig[kind];
                const query = queries[reportKinds.indexOf(kind)];
                const summary = summaryOf(query.data);
                const Icon = icons[kind];
                return (
                  <Card key={kind} className="flex min-h-[230px] flex-col">
                    <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <CardTitle>{config.shortTitle}</CardTitle>
                        <p className="mt-1.5 text-meta leading-5">{config.description}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="mb-4 grid grid-cols-2 gap-3 border-y border-border/70 py-3">
                        {[config.primaryKpi, config.secondaryKpi].filter(Boolean).map((key) => (
                          <div key={key}>
                            <p className="text-meta">{fieldLabels[key!] ?? key}</p>
                            {query.isPending ? (
                              <span className="mt-2 block h-5 w-20 animate-pulse rounded bg-muted" />
                            ) : query.isError ? (
                              <p className="mt-1 text-sm font-semibold text-destructive">غير متاح</p>
                            ) : (
                              <p className="mt-1 font-numeric text-base font-bold text-foreground">
                                {kpiValue(key!, summary[key!])}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button asChild className="w-full justify-between" variant="outline">
                        <Link to={`/reports/${kind}`}>
                          عرض التقرير
                          <ArrowLeft aria-hidden="true" className="size-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
    </PageContainer>
  );
}
