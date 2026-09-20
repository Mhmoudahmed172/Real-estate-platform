import { motion } from "framer-motion";
import { Receipt } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ActiveFilterBanner } from "@/components/feedback/ActiveFilterBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Pagination } from "@/components/tables/Pagination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { usePaymentsPage } from "@/features/payments/usePayments";
import { formatCurrency, formatDate, parseMoney } from "@/lib/format";
import { formatDemoReference } from "@/lib/display";
import { paymentStatusLabels } from "@/lib/labels";
import { pageMotion } from "@/lib/motion";
import { readPageParams, writePageParams } from "@/lib/pagination";
import { paymentStatuses, type PaymentOut, type PaymentStatus } from "@/types/resources";

export function PaymentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const contractId = searchParams.get("contract_id") ? Number(searchParams.get("contract_id")) : null;
  const status = ((searchParams.get("status_filter") ?? searchParams.get("status")) as PaymentStatus | null) ?? null;
  const dueFrom = searchParams.get("due_from") ?? "";
  const dueTo = searchParams.get("due_to") ?? "";
  const overdue = searchParams.get("overdue") === "true" || searchParams.get("overdue") === "1";
  const pagination = readPageParams(searchParams);
  const params = useMemo(() => ({ contract_id: contractId, status_filter: status, due_from: dueFrom || null, due_to: dueTo || null, overdue: overdue || null, page: pagination.page, page_size: pagination.page_size }), [contractId, dueFrom, dueTo, overdue, pagination.page, pagination.page_size, status]);
  const listQuery = usePaymentsPage(params);
  const pageData = listQuery.data;
  const paginationProps = pageData ? { page: pageData.page, pageSize: pageData.page_size, total: pageData.total, totalPages: pageData.total_pages, onPageChange: (page: number) => setSearchParams(writePageParams(searchParams, { page })), onPageSizeChange: (page_size: typeof pageData.page_size) => setSearchParams(writePageParams(searchParams, { page_size })) } : undefined;

  function updateParams(next: Record<string, string | null>) {
    const resolved = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => value ? resolved.set(key, value) : resolved.delete(key));
    if (next.contract_id !== undefined || next.status !== undefined || next.due_from !== undefined || next.due_to !== undefined) resolved.delete("page");
    setSearchParams(resolved);
  }

  const columns: Array<DataTableColumn<PaymentOut>> = [
    { id: "payment", header: "الدفعة", cell: (row) => <div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><Receipt aria-hidden="true" className="size-4" /></span><div><p className="font-semibold text-foreground">{formatDemoReference(row.receipt_number) ? `إيصال ${formatDemoReference(row.receipt_number)}` : `استحقاق ${formatDate(row.due_date)}`}</p><p className="text-meta">{formatCurrency(parseMoney(row.amount_due) ?? 0)}</p></div></div> },
    { id: "due", header: "الاستحقاق", cell: (row) => formatDate(row.due_date) },
    { id: "amount", header: "المستحق", numeric: true, cell: (row) => formatCurrency(parseMoney(row.amount_due) ?? 0) },
    { id: "paid", header: "المدفوع", numeric: true, cell: (row) => formatCurrency(parseMoney(row.amount_paid) ?? 0) },
    { id: "paidDate", header: "تاريخ الدفع", cell: (row) => row.paid_date ? formatDate(row.paid_date) : "—" },
    { id: "status", header: "الحالة", cell: (row) => <PaymentStatusBadge status={row.status} /> },
  ];

  return <motion.div {...pageMotion}><PageContainer>
    <PageHeader eyebrow="المدفوعات" title="المدفوعات" description="متابعة الدفعات المجدولة حسب العقد والحالة ونطاق تاريخ الاستحقاق." />
    <section className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-card md:grid-cols-5 md:items-end">
      <label className="block space-y-1.5"><span className="text-meta">رقم العقد</span><Input className="rounded-xl" inputMode="numeric" defaultValue={contractId ?? ""} placeholder="كل العقود" onBlur={(event) => updateParams({ contract_id: event.target.value.trim() || null })} onKeyDown={(event) => { if (event.key === "Enter") updateParams({ contract_id: event.currentTarget.value.trim() || null }); }} /></label>
      <div className="space-y-1.5"><p className="text-meta">الحالة</p><Select value={status ?? "all"} onValueChange={(value) => updateParams({ status: value === "all" ? null : value })}><SelectTrigger className="rounded-xl"><SelectValue placeholder="كل الحالات" /></SelectTrigger><SelectContent><SelectItem value="all">كل الحالات</SelectItem>{paymentStatuses.map((item) => <SelectItem key={item} value={item}>{paymentStatusLabels[item]}</SelectItem>)}</SelectContent></Select></div>
      <label className="block space-y-1.5"><span className="text-meta">من تاريخ</span><Input className="rounded-xl" type="date" defaultValue={dueFrom} onBlur={(event) => updateParams({ due_from: event.target.value || null })} /></label>
      <label className="block space-y-1.5"><span className="text-meta">إلى تاريخ</span><Input className="rounded-xl" type="date" defaultValue={dueTo} onBlur={(event) => updateParams({ due_to: event.target.value || null })} /></label>
      <Button className="h-11 rounded-xl" variant="outline" onClick={() => setSearchParams(new URLSearchParams())}>مسح التصفية</Button>
    </section>
    {overdue ? <ActiveFilterBanner description="الدفعات التي تجاوز تاريخ استحقاقها وما زال عليها متبقٍ." label="المدفوعات المتأخرة" /> : null}
    {listQuery.isError ? <ErrorState title="تعذر تحميل المدفوعات" description="تعذر تحميل قائمة المدفوعات." onRetry={() => void listQuery.refetch()} /> : <><div className="hidden md:block"><DataTable actions={(row) => <Button asChild className="rounded-full" size="sm" variant="ghost"><Link to={`/payments/${row.id}`}>عرض</Link></Button>} columns={columns} data={pageData?.items ?? []} emptyDescription="لا توجد مدفوعات مطابقة لعوامل التصفية الحالية." emptyTitle="لا توجد مدفوعات" getRowId={(row) => row.id} loading={listQuery.isPending} pagination={paginationProps} updating={listQuery.isFetching && !listQuery.isPending} onRowClick={(row) => navigate(`/payments/${row.id}`)} /></div><div className="grid gap-2 md:hidden">{listQuery.isPending ? <p className="rounded-lg border border-border bg-card px-4 py-5 text-sm text-muted-foreground">جاري تحميل المدفوعات...</p> : (pageData?.items ?? []).length === 0 ? <EmptyState compact description="لا توجد مدفوعات مطابقة لعوامل التصفية الحالية." title="لا توجد مدفوعات" /> : null}{(pageData?.items ?? []).map((payment) => <Link key={payment.id} className="rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-fast hover:-translate-y-0.5 hover:shadow-card-hover" to={`/payments/${payment.id}`}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-foreground">{formatDemoReference(payment.receipt_number) ? `إيصال ${formatDemoReference(payment.receipt_number)}` : `استحقاق ${formatDate(payment.due_date)}`}</p><p className="mt-1 text-meta">{formatCurrency(parseMoney(payment.amount_due) ?? 0)}</p></div><PaymentStatusBadge status={payment.status} /></div><p className="mt-2 text-meta">{formatDate(payment.due_date)}</p></Link>)}{paginationProps ? <Pagination {...paginationProps} isFetching={listQuery.isFetching && !listQuery.isPending} /> : null}</div></>}
  </PageContainer></motion.div>;
}
