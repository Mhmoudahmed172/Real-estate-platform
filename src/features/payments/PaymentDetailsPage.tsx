import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { paymentsApi } from "@/api/payments.api";
import { Can } from "@/app/guards/Can";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { FormField } from "@/components/forms/FormField";
import { DetailGrid, DetailItem } from "@/components/layout/DetailGrid";
import { JsonPreview } from "@/components/layout/JsonPreview";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ContractStatusBadge, PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { paymentAdjustmentSchema, paymentRecordSchema, type PaymentAdjustmentValues, type PaymentRecordValues } from "@/features/payments/paymentSchema";
import { usePayment, usePaymentAdjustments, usePaymentContract, usePaymentMutations, usePaymentTransactions } from "@/features/payments/usePayments";
import { applyApiFieldErrors } from "@/lib/formErrors";
import { formatCurrency, formatDate, parseMoney } from "@/lib/format";
import { isRecord } from "@/lib/guards";
import { pageMotion } from "@/lib/motion";

type ActionDialogProps<T> = { open: boolean; isLoading: boolean; onOpenChange: (open: boolean) => void; onSubmit: (values: T) => Promise<void> };


function RecordPaymentDialog({ open, isLoading, onOpenChange, onSubmit }: ActionDialogProps<PaymentRecordValues>) {
  const form = useForm<PaymentRecordValues>({ resolver: zodResolver(paymentRecordSchema), defaultValues: { amount_paid: 0, paid_date: "", discount: undefined, penalty: undefined, receipt_number: "" } });
  async function submit(values: PaymentRecordValues) { try { await onSubmit(values); form.reset(); onOpenChange(false); } catch (error) { const apiError = applyApiFieldErrors(error, form.setError); form.setError("root", { message: apiError.message }); } }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>تسجيل دفعة</DialogTitle><DialogDescription>يسجل هذا الإجراء دفعة موجودة باستخدام PaymentRecord، ولا ينشئ دفعة جديدة.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(event) => void form.handleSubmit(submit)(event)}><div className="grid gap-4 md:grid-cols-2"><FormField error={form.formState.errors.amount_paid?.message} htmlFor="record-amount" label="المبلغ المدفوع" required><Input id="record-amount" type="number" step="0.01" {...form.register("amount_paid")} /></FormField><FormField error={form.formState.errors.paid_date?.message} htmlFor="record-date" label="تاريخ الدفع"><Input id="record-date" type="date" {...form.register("paid_date")} /></FormField><FormField error={form.formState.errors.discount?.message} htmlFor="record-discount" label="خصم"><Input id="record-discount" type="number" step="0.01" {...form.register("discount")} /></FormField><FormField error={form.formState.errors.penalty?.message} htmlFor="record-penalty" label="غرامة"><Input id="record-penalty" type="number" step="0.01" {...form.register("penalty")} /></FormField><FormField error={form.formState.errors.receipt_number?.message} htmlFor="record-receipt" label="رقم الإيصال"><Input id="record-receipt" {...form.register("receipt_number")} /></FormField></div>{form.formState.errors.root?.message ? <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p> : null}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button><Button isLoading={isLoading} type="submit">تسجيل الدفعة</Button></div></form></DialogContent></Dialog>;
}

function AdjustmentDialog({ open, isLoading, onOpenChange, onSubmit }: ActionDialogProps<PaymentAdjustmentValues>) {
  const form = useForm<PaymentAdjustmentValues>({ resolver: zodResolver(paymentAdjustmentSchema), defaultValues: { discount: 0, penalty: 0, reason: "" } });
  async function submit(values: PaymentAdjustmentValues) { try { await onSubmit(values); form.reset(); onOpenChange(false); } catch (error) { const apiError = applyApiFieldErrors(error, form.setError); form.setError("root", { message: apiError.message }); } }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>إضافة تسوية</DialogTitle><DialogDescription>تستخدم هذه العملية حقول Adjustment الموثقة: الخصم والغرامة والسبب.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(event) => void form.handleSubmit(submit)(event)}><div className="grid gap-4 md:grid-cols-2"><FormField error={form.formState.errors.discount?.message} htmlFor="adjust-discount" label="خصم"><Input id="adjust-discount" type="number" step="0.01" {...form.register("discount")} /></FormField><FormField error={form.formState.errors.penalty?.message} htmlFor="adjust-penalty" label="غرامة"><Input id="adjust-penalty" type="number" step="0.01" {...form.register("penalty")} /></FormField></div><FormField error={form.formState.errors.reason?.message} htmlFor="adjust-reason" label="السبب" required><Textarea id="adjust-reason" rows={3} {...form.register("reason")} /></FormField>{form.formState.errors.root?.message ? <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p> : null}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button><Button isLoading={isLoading} type="submit">حفظ التسوية</Button></div></form></DialogContent></Dialog>;
}

export function PaymentDetailsPage() {
  const { id } = useParams();
  const paymentId = id ? Number(id) : undefined;
  const paymentQuery = usePayment(paymentId);
  const contractQuery = usePaymentContract(paymentQuery.data?.contract_id);
  const transactionsQuery = usePaymentTransactions(paymentId);
  const adjustmentsQuery = usePaymentAdjustments(paymentId);
  const { recordMutation, adjustMutation } = usePaymentMutations(paymentId, paymentQuery.data?.contract_id);
  const [recordOpen, setRecordOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);

  async function downloadReceipt(transactionId: number) {
    if (!paymentId) return;
    setReceiptLoading(true);
    try {
      const blob = await paymentsApi.receipt(paymentId, transactionId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `receipt-${paymentId}-${transactionId}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally { setReceiptLoading(false); }
  }

  if (paymentQuery.isPending) return <LoadingState label="جاري تحميل الدفعة" />;
  if (paymentQuery.isError || !paymentQuery.data) return <ErrorState title="تعذر تحميل الدفعة" description="لم نتمكن من تحميل تفاصيل الدفعة." onRetry={() => void paymentQuery.refetch()} />;
  const payment = paymentQuery.data;
  const transactions = Array.isArray(transactionsQuery.data) ? transactionsQuery.data : [];
  const adjustments = Array.isArray(adjustmentsQuery.data) ? adjustmentsQuery.data : [];
  const firstTransactionId = transactions.map((item) => isRecord(item) && typeof item.id === "number" ? item.id : null).find((item): item is number => item !== null);

  return <motion.div {...pageMotion}><PageContainer>
    <PageHeader eyebrow="المدفوعات" title={`دفعة #${payment.id}`} description="تفاصيل الدفعة وتسجيل السداد والتسويات المرتبطة بها." actions={<div className="flex flex-wrap gap-2"><Can permission="payments.update"><Button className="rounded-full" onClick={() => setRecordOpen(true)}>تسجيل دفعة</Button><Button className="rounded-full" variant="outline" onClick={() => setAdjustOpen(true)}>إضافة تسوية</Button></Can>{firstTransactionId ? <Button className="rounded-full" isLoading={receiptLoading} variant="outline" onClick={() => void downloadReceipt(firstTransactionId)}><Download aria-hidden="true" className="size-4" /> تحميل إيصال</Button> : null}</div>} />
    <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>بيانات الدفعة</CardTitle><PaymentStatusBadge status={payment.status} /></div></CardHeader><CardContent><DetailGrid><DetailItem label="العقد" value={`#${payment.contract_id}`} /><DetailItem label="تاريخ الاستحقاق" value={formatDate(payment.due_date)} /><DetailItem label="تاريخ الدفع" value={payment.paid_date ? formatDate(payment.paid_date) : null} /><DetailItem label="المبلغ المستحق" value={formatCurrency(parseMoney(payment.amount_due) ?? 0)} /><DetailItem label="المبلغ المدفوع" value={formatCurrency(parseMoney(payment.amount_paid) ?? 0)} /><DetailItem label="الخصم" value={formatCurrency(parseMoney(payment.discount) ?? 0)} /><DetailItem label="الغرامة" value={formatCurrency(parseMoney(payment.penalty) ?? 0)} /><DetailItem label="رقم الإيصال" value={payment.receipt_number} /></DetailGrid></CardContent></Card>
    {contractQuery.data ? <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>العقد المرتبط</CardTitle><ContractStatusBadge status={contractQuery.data.status} /></div></CardHeader><CardContent><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">عقد #{contractQuery.data.id} · {formatDate(contractQuery.data.start_date)} - {formatDate(contractQuery.data.end_date)}</p><Button asChild className="rounded-full" size="sm" variant="outline"><Link to={`/contracts/${contractQuery.data.id}`}>فتح العقد</Link></Button></div></CardContent></Card> : null}
    <Card><CardHeader><CardTitle>سجل العمليات</CardTitle></CardHeader><CardContent>{transactionsQuery.isError ? <ErrorState compact title="تعذر تحميل العمليات" description="Endpoint العمليات لم يرجع بيانات قابلة للعرض." /> : <JsonPreview rows={transactions} emptyTitle="لا توجد عمليات" />}</CardContent></Card>
    <Card><CardHeader><CardTitle>التسويات</CardTitle></CardHeader><CardContent>{adjustmentsQuery.isError ? <ErrorState compact title="تعذر تحميل التسويات" description="Endpoint التسويات لم يرجع بيانات قابلة للعرض." /> : <JsonPreview rows={adjustments} emptyTitle="لا توجد تسويات" />}</CardContent></Card>
    <RecordPaymentDialog open={recordOpen} isLoading={recordMutation.isPending} onOpenChange={setRecordOpen} onSubmit={async (values) => { await recordMutation.mutateAsync({ id: payment.id, payload: values }); }} />
    <AdjustmentDialog open={adjustOpen} isLoading={adjustMutation.isPending} onOpenChange={setAdjustOpen} onSubmit={async (values) => { await adjustMutation.mutateAsync({ id: payment.id, payload: values }); }} />
  </PageContainer></motion.div>;
}








