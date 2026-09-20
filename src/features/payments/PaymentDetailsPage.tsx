import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { paymentsApi } from "@/api/payments.api";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { FormField } from "@/components/forms/FormField";
import { ActivityTimeline, type TimelineItem } from "@/components/layout/ActivityTimeline";
import { DetailGrid, DetailItem } from "@/components/layout/DetailGrid";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { type ActionMenuItem } from "@/components/ui/ActionMenu";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ContractStatusBadge, PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { paymentAdjustmentSchema, paymentRecordSchema, type PaymentAdjustmentValues, type PaymentRecordValues } from "@/features/payments/paymentSchema";
import { usePayment, usePaymentActivity, usePaymentContract, usePaymentMutations, usePaymentTransactions } from "@/features/payments/usePayments";
import { applyApiFieldErrors } from "@/lib/formErrors";
import { formatDemoReference } from "@/lib/display";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { actorMeta, paymentActivityTitle, receiptMeta } from "@/lib/operationalLabels";
import { AuditLogSection } from "@/components/layout/AuditLogSection";
import { asNumber, isRecord } from "@/lib/guards";
import { pageMotion } from "@/lib/motion";

type ActionDialogProps<T> = {
  open: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: T) => Promise<void>;
};

function RecordPaymentDialog({ open, isLoading, onOpenChange, onSubmit }: ActionDialogProps<PaymentRecordValues>) {
  const form = useForm<PaymentRecordValues>({
    resolver: zodResolver(paymentRecordSchema),
    defaultValues: { amount_paid: 0, paid_date: "", discount: undefined, penalty: undefined, receipt_number: "" },
  });
  async function submit(values: PaymentRecordValues) {
    try {
      await onSubmit(values);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      const apiError = applyApiFieldErrors(error, form.setError);
      form.setError("root", { message: apiError.message });
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تسجيل دفعة</DialogTitle>
          <DialogDescription>تسجيل سداد على هذه الدفعة المجدولة.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(event) => void form.handleSubmit(submit)(event)}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={form.formState.errors.amount_paid?.message} htmlFor="record-amount" label="المبلغ المدفوع" required>
              <Input id="record-amount" step="0.01" type="number" {...form.register("amount_paid")} />
            </FormField>
            <FormField error={form.formState.errors.paid_date?.message} htmlFor="record-date" label="تاريخ الدفع">
              <Input id="record-date" type="date" {...form.register("paid_date")} />
            </FormField>
            <FormField error={form.formState.errors.discount?.message} htmlFor="record-discount" label="خصم">
              <Input id="record-discount" step="0.01" type="number" {...form.register("discount")} />
            </FormField>
            <FormField error={form.formState.errors.penalty?.message} htmlFor="record-penalty" label="غرامة">
              <Input id="record-penalty" step="0.01" type="number" {...form.register("penalty")} />
            </FormField>
            <FormField error={form.formState.errors.receipt_number?.message} htmlFor="record-receipt" label="رقم الإيصال">
              <Input id="record-receipt" {...form.register("receipt_number")} />
            </FormField>
          </div>
          {form.formState.errors.root?.message ? (
            <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button isLoading={isLoading} type="submit">تسجيل الدفعة</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdjustmentDialog({ open, isLoading, onOpenChange, onSubmit }: ActionDialogProps<PaymentAdjustmentValues>) {
  const form = useForm<PaymentAdjustmentValues>({
    resolver: zodResolver(paymentAdjustmentSchema),
    defaultValues: { discount: 0, penalty: 0, reason: "" },
  });
  async function submit(values: PaymentAdjustmentValues) {
    try {
      await onSubmit(values);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      const apiError = applyApiFieldErrors(error, form.setError);
      form.setError("root", { message: apiError.message });
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة تسوية</DialogTitle>
          <DialogDescription>أدخل الخصم أو الغرامة مع سبب التسوية.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(event) => void form.handleSubmit(submit)(event)}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={form.formState.errors.discount?.message} htmlFor="adjust-discount" label="خصم">
              <Input id="adjust-discount" step="0.01" type="number" {...form.register("discount")} />
            </FormField>
            <FormField error={form.formState.errors.penalty?.message} htmlFor="adjust-penalty" label="غرامة">
              <Input id="adjust-penalty" step="0.01" type="number" {...form.register("penalty")} />
            </FormField>
          </div>
          <FormField error={form.formState.errors.reason?.message} htmlFor="adjust-reason" label="السبب" required>
            <Textarea id="adjust-reason" rows={3} {...form.register("reason")} />
          </FormField>
          {form.formState.errors.root?.message ? (
            <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button isLoading={isLoading} type="submit">حفظ التسوية</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentDetailsPage() {
  const { id } = useParams();
  const { can } = useAuthorization();
  const paymentId = id ? Number(id) : undefined;
  const paymentQuery = usePayment(paymentId);
  const contractQuery = usePaymentContract(paymentQuery.data?.contract_id);
  const transactionsQuery = usePaymentTransactions(paymentId);
  const activityQuery = usePaymentActivity(paymentId);
  const { recordMutation, adjustMutation } = usePaymentMutations(paymentId, paymentQuery.data?.contract_id);
  const [recordOpen, setRecordOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);

  const firstTransactionId = useMemo(() => {
    const rows = Array.isArray(transactionsQuery.data) ? transactionsQuery.data : [];
    return rows.map((item) => (isRecord(item) ? asNumber(item.id) : null)).find((item): item is number => item !== null) ?? null;
  }, [transactionsQuery.data]);

  const timelineItems = useMemo<TimelineItem[]>(() => {
    return (activityQuery.data ?? []).map((entry, index) => {
      const meta = [receiptMeta(entry.receipt_reference), actorMeta(entry.actor_name)].filter(Boolean).join(" · ");
      return {
        id: `${entry.event_type}-${entry.timestamp}-${index}`,
        title: paymentActivityTitle(entry.event_type, entry.amount),
        description: entry.event_type === "payment_adjusted" ? entry.description : null,
        meta: meta || null,
        timestamp: formatDateTime(entry.timestamp),
      };
    });
  }, [activityQuery.data]);

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
    } finally {
      setReceiptLoading(false);
    }
  }

  if (paymentQuery.isPending) return <LoadingState label="جاري تحميل الدفعة" />;
  if (paymentQuery.isError || !paymentQuery.data) {
    return <ErrorState description="لم نتمكن من تحميل تفاصيل الدفعة." title="تعذر تحميل الدفعة" onRetry={() => void paymentQuery.refetch()} />;
  }
  const payment = paymentQuery.data;
  const receipt = formatDemoReference(payment.receipt_number);
  const title = receipt ? `إيصال ${receipt}` : `دفعة استحقاق ${formatDate(payment.due_date)}`;

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <DetailHeader
          backLabel="العودة إلى المدفوعات"
          backTo="/payments"
          badges={<PaymentStatusBadge status={payment.status} />}
          description={`استحقاق ${formatDate(payment.due_date)}`}
          eyebrow="المدفوعات"
          menuItems={[
            ...(can("payments.update") ? [{ id: "adjust", label: "إضافة تسوية", onSelect: () => setAdjustOpen(true) }] : []),
            ...(firstTransactionId
              ? [{ id: "receipt", label: "تحميل إيصال", onSelect: () => void downloadReceipt(firstTransactionId) }]
              : []),
          ] satisfies ActionMenuItem[]}
          primaryAction={
            can("payments.update") ? (
              <Button className="rounded-full" onClick={() => setRecordOpen(true)}>تسجيل دفعة</Button>
            ) : firstTransactionId ? (
              <Button className="rounded-full" isLoading={receiptLoading} variant="outline" onClick={() => void downloadReceipt(firstTransactionId)}>
                <Download aria-hidden="true" className="size-4" />
                تحميل إيصال
              </Button>
            ) : null
          }
          title={title}
        />
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>بيانات الدفعة</CardTitle>
              <PaymentStatusBadge status={payment.status} />
            </div>
          </CardHeader>
          <CardContent>
            <DetailGrid>
              <DetailItem label="تاريخ الاستحقاق" value={formatDate(payment.due_date)} />
              <DetailItem label="تاريخ الدفع" value={payment.paid_date ? formatDate(payment.paid_date) : null} />
              <DetailItem important label="المبلغ المستحق" value={formatMoney(payment.amount_due)} />
              <DetailItem important label="المبلغ المدفوع" value={formatMoney(payment.amount_paid)} />
              <DetailItem label="الخصم" value={formatMoney(payment.discount)} />
              <DetailItem label="الغرامة" value={formatMoney(payment.penalty)} />
              <DetailItem label="رقم الإيصال" value={receipt} />
            </DetailGrid>
          </CardContent>
        </Card>
        {contractQuery.data ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>العقد المرتبط</CardTitle>
                <ContractStatusBadge endDate={contractQuery.data.end_date} status={contractQuery.data.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {formatDate(contractQuery.data.start_date)} - {formatDate(contractQuery.data.end_date)}
                </p>
                <Button asChild className="rounded-full" size="sm" variant="outline">
                  <Link to={`/contracts/${contractQuery.data.id}`}>فتح العقد</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>سجل العمليات</CardTitle>
          </CardHeader>
          <CardContent>
            {activityQuery.isError ? (
              <ErrorState compact description="تعذر تحميل سجل هذه الدفعة." title="تعذر تحميل السجل" />
            ) : (
              <ActivityTimeline emptyDescription="لم تُسجَّل عمليات على هذه الدفعة بعد." emptyTitle="لا توجد عمليات" items={timelineItems} />
            )}
          </CardContent>
        </Card>
        <AuditLogSection entityId={payment.id} entityType="payment" />
        <RecordPaymentDialog
          isLoading={recordMutation.isPending}
          open={recordOpen}
          onOpenChange={setRecordOpen}
          onSubmit={async (values) => {
            await recordMutation.mutateAsync({ id: payment.id, payload: values });
          }}
        />
        <AdjustmentDialog
          isLoading={adjustMutation.isPending}
          open={adjustOpen}
          onOpenChange={setAdjustOpen}
          onSubmit={async (values) => {
            await adjustMutation.mutateAsync({ id: payment.id, payload: values });
          }}
        />
      </PageContainer>
    </motion.div>
  );
}
