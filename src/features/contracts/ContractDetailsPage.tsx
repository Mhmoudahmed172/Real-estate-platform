import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { FormField } from "@/components/forms/FormField";
import { DetailGrid, DetailItem } from "@/components/layout/DetailGrid";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { ContractStatusBadge, PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { renewalSchema, type RenewalValues } from "@/features/contracts/contractSchema";
import { useContract, useContractMutations, useContractPayments, useContractRelations } from "@/features/contracts/useContracts";
import { applyApiFieldErrors } from "@/lib/formErrors";
import { formatCurrency, formatDate, parseMoney } from "@/lib/format";
import { paymentFrequencyLabels } from "@/lib/labels";
import { pageMotion } from "@/lib/motion";
import type { PaymentOut } from "@/types/resources";


function RenewalDialog({ open, currentEndDate, isLoading, onOpenChange, onSubmit }: { open: boolean; currentEndDate: string; isLoading: boolean; onOpenChange: (open: boolean) => void; onSubmit: (values: RenewalValues) => Promise<void> }) {
  const form = useForm<RenewalValues>({ resolver: zodResolver(renewalSchema), defaultValues: { start_date: currentEndDate, end_date: "", rent_value: 0 } });
  async function submit(values: RenewalValues) {
    try { await onSubmit(values); form.reset(); onOpenChange(false); } catch (error) { const apiError = applyApiFieldErrors(error, form.setError); form.setError("root", { message: apiError.message }); }
  }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>تجديد العقد</DialogTitle><DialogDescription>أدخل قيم التجديد المطلوبة في Renewal. تاريخ نهاية العقد الحالي: {formatDate(currentEndDate)}.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(event) => void form.handleSubmit(submit)(event)}><div className="grid gap-4 md:grid-cols-2"><FormField error={form.formState.errors.start_date?.message} htmlFor="renew-start" label="تاريخ البداية" required><Input id="renew-start" type="date" {...form.register("start_date")} /></FormField><FormField error={form.formState.errors.end_date?.message} htmlFor="renew-end" label="تاريخ النهاية" required><Input id="renew-end" type="date" {...form.register("end_date")} /></FormField><FormField error={form.formState.errors.rent_value?.message} htmlFor="renew-rent" label="قيمة الإيجار" required><Input id="renew-rent" type="number" step="0.01" {...form.register("rent_value")} /></FormField></div>{form.formState.errors.root?.message ? <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p> : null}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button><Button isLoading={isLoading} type="submit"><RefreshCcw aria-hidden="true" className="size-4" /> تجديد العقد</Button></div></form></DialogContent></Dialog>;
}

export function ContractDetailsPage() {
  const { id } = useParams();
  const contractId = id ? Number(id) : undefined;
  const contractQuery = useContract(contractId);
  const paymentsQuery = useContractPayments(contractId);
  const relations = useContractRelations(contractQuery.data);
  const { renewMutation, cancelMutation, terminateMutation } = useContractMutations();
  const [renewOpen, setRenewOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [terminateOpen, setTerminateOpen] = useState(false);

  const columns: Array<DataTableColumn<PaymentOut>> = [
    { id: "due", header: "الاستحقاق", cell: (row) => formatDate(row.due_date) },
    { id: "amount", header: "المستحق", numeric: true, cell: (row) => formatCurrency(parseMoney(row.amount_due) ?? 0) },
    { id: "paid", header: "المدفوع", numeric: true, cell: (row) => formatCurrency(parseMoney(row.amount_paid) ?? 0) },
    { id: "status", header: "الحالة", cell: (row) => <PaymentStatusBadge status={row.status} /> },
    { id: "receipt", header: "الإيصال", cell: (row) => row.receipt_number ?? "—" },
  ];

  if (contractQuery.isPending) return <LoadingState label="جاري تحميل العقد" />;
  if (contractQuery.isError || !contractQuery.data) return <ErrorState title="تعذر تحميل العقد" description="لم نتمكن من تحميل تفاصيل العقد." onRetry={() => void contractQuery.refetch()} />;
  const contract = contractQuery.data;

  return <motion.div {...pageMotion}><PageContainer>
    <PageHeader eyebrow="العقود" title={`عقد #${contract.id}`} description="تفاصيل العقد وجدول الدفعات المرتبط به من backend." actions={<div className="flex flex-wrap gap-2"><Button asChild className="rounded-full" variant="outline"><Link to={`/contracts/${contract.id}/edit`}>تعديل</Link></Button><Button className="rounded-full" variant="outline" onClick={() => setRenewOpen(true)}>تجديد</Button><Button className="rounded-full" variant="outline" onClick={() => setCancelOpen(true)}>إلغاء</Button><Button className="rounded-full" variant="destructive" onClick={() => setTerminateOpen(true)}>إنهاء</Button></div>} />
    <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>بيانات العقد</CardTitle><ContractStatusBadge status={contract.status} /></div></CardHeader><CardContent><DetailGrid><DetailItem label="العقار" value={relations.propertyQuery.data?.name ?? `#${contract.property_id}`} /><DetailItem label="الوحدة" value={relations.unitQuery.data?.unit_number ?? `#${contract.unit_id}`} /><DetailItem label="المالك" value={relations.ownerQuery.data?.full_name ?? `#${contract.owner_id}`} /><DetailItem label="المستأجر" value={relations.tenantQuery.data?.full_name ?? `#${contract.tenant_id}`} /><DetailItem label="تاريخ البداية" value={formatDate(contract.start_date)} /><DetailItem label="تاريخ النهاية" value={formatDate(contract.end_date)} /><DetailItem label="الإيجار" value={formatCurrency(parseMoney(contract.rent_value) ?? 0)} /><DetailItem label="دورية الدفع" value={contract.payment_frequency ? paymentFrequencyLabels[contract.payment_frequency] : "—"} /><DetailItem label="التأمين" value={contract.deposit_amount ? formatCurrency(parseMoney(contract.deposit_amount) ?? 0) : "—"} /></DetailGrid>{contract.terms ? <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4"><p className="text-meta">الشروط</p><p className="mt-2 leading-7 text-foreground">{contract.terms}</p></div> : null}</CardContent></Card>
    <section className="space-y-3"><h2 className="text-section text-foreground">دفعات العقد</h2>{paymentsQuery.isError ? <ErrorState compact title="تعذر تحميل دفعات العقد" description="يمكن متابعة تفاصيل العقد بدون جدول الدفعات." onRetry={() => void paymentsQuery.refetch()} /> : <DataTable columns={columns} data={paymentsQuery.data ?? []} emptyDescription="لا توجد دفعات مرتبطة بهذا العقد." emptyTitle="لا توجد دفعات" getRowId={(row) => row.id} loading={paymentsQuery.isPending} actions={(row) => <Button asChild className="rounded-full" size="sm" variant="ghost"><Link to={`/payments/${row.id}`}>عرض</Link></Button>} />}</section>
    <RenewalDialog open={renewOpen} currentEndDate={contract.end_date} isLoading={renewMutation.isPending} onOpenChange={setRenewOpen} onSubmit={async (values) => { await renewMutation.mutateAsync({ id: contract.id, payload: values }); }} />
    <ConfirmDialog open={cancelOpen} title="إلغاء العقد" description="سيتم إرسال طلب إلغاء العقد إلى endpoint الإلغاء بدون حقول إضافية لأن OpenAPI لا يوثق body لهذا الإجراء." confirmLabel="إلغاء العقد" isLoading={cancelMutation.isPending} onOpenChange={setCancelOpen} onConfirm={() => void cancelMutation.mutateAsync(contract.id).then(() => setCancelOpen(false))} />
    <ConfirmDialog open={terminateOpen} title="إنهاء العقد" description="سيتم إرسال طلب إنهاء العقد إلى endpoint الإنهاء المنفصل عن الإلغاء." confirmLabel="إنهاء العقد" isLoading={terminateMutation.isPending} onOpenChange={setTerminateOpen} onConfirm={() => void terminateMutation.mutateAsync(contract.id).then(() => setTerminateOpen(false))} />
  </PageContainer></motion.div>;
}




