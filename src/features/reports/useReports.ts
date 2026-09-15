import { useMutation, useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/api/reports.api";
import { queryKeys } from "@/lib/queryKeys";
import type { ReportKind, ReportParams } from "@/types/domain";

export function useReport(kind: ReportKind, params: ReportParams) {
  return useQuery({ queryKey: queryKeys.reports.detail(kind, params), queryFn: () => reportsApi.get(kind, params) });
}

export function useReportExport() {
  return useMutation({ mutationFn: ({ kind, params }: { kind: ReportKind; params: ReportParams }) => reportsApi.export(kind, params) });
}
