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
import { DetailHeader } from "@/components/layout/DetailHeader";
import { AuditLogSection } from "@/components/layout/AuditLogSection";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { ContractStatusBadge, PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { renewalSchema, type RenewalValues } from "@/features/contracts/contractSchema";
import { useContract, useContractMutations, useContractPayments, useContractRelations } from "@/features/contracts/useContracts";
import { applyApiFieldErrors } from "@/lib/formErrors";
import { formatDisplayText, relationLabel } from "@/lib/display";
import { formatCurrency, formatDate, formatDaysRemaining, formatMoney, formatNumber, parseMoney } from "@/lib/format";
import { formatCollectionStatus } from "@/lib/operationalLabels";
import { paymentFrequencyLabels } from "@/lib/labels";
import { pageMotion } from "@/lib/motion";
import type { PaymentOut } from "@/types/resources";

function RenewalDialog({
  open,
  currentEndDate,
  isLoading,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  currentEndDate: string;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RenewalValues) => Promise<void>;
}) {
  const form = useForm<RenewalValues>({ resolver: zodResolver(renewalSchema), defaultValues: { start_date: currentEndDate, end_date: "", rent_value: 0 } });
  async function submit(values: RenewalValues) {
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
          <DialogTitle>تجديد العقد</DialogTitle>
          <DialogDescription>تاريخ نهاية العقد الحالي: {formatDate(currentEndDate)}.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(event) => void form.handleSubmit(submit)(event)}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={form.formState.errors.start_date?.message} htmlFor="renew-start" label="تاريخ البداية" required>
              <Input id="renew-start" type="date" {...form.register("start_date")} />
            </FormField>
            <FormField error={form.formState.errors.end_date?.message} htmlFor="renew-end" label="تاريخ النهاية" required>
              <Input id="renew-end" type="date" {...form.register("end_date")} />
            </FormField>
            <FormField error={form.formState.errors.rent_value?.message} htmlFor="renew-rent" label="قيمة الإيجار" required>
              <Input id="renew-rent" step="0.01" type="number" {...form.register("rent_value")} />
            </FormField>
          </div>
          {form.formState.errors.root?.message ? (
            <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button isLoading={isLoading} type="submit">
              <RefreshCcw aria-hidden="true" className="size-4" />
              تجديد العقد
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ContractDetailsPage() {
  const { id } = useParams();
  const { can } = useAuthorization();
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
    { id: "receipt", header: "الإيصال", cell: (row) => row.receipt_number ? formatDisplayText(row.receipt_number) : "—" },
  ];

  if (contractQuery.isPending) return <LoadingState label="جاري تحميل العقد" />;
  if (contractQuery.isError || !contractQuery.data) {
    return <ErrorState description="لم نتمكن من تحميل تفاصيل العقد." title="تعذر تحميل العقد" onRetry={() => void contractQuery.refetch()} />;
  }
  const contract = contractQuery.data;
  const tenantName = relations.tenantQuery.data?.full_name;
  const unitLabel = relations.unitQuery.data?.unit_number;
  const title = [unitLabel, tenantName].filter(Boolean).join(" · ") || "عقد إيجار";
  const terms = formatDisplayText(contract.terms);

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <DetailHeader
          backLabel="العودة إلى العقود"
          backTo="/contracts"
          badges={<ContractStatusBadge endDate={contract.end_date} status={contract.status} />}
          description={`${formatDate(contract.start_date)} — ${formatDate(contract.end_date)}${contract.days_remaining == null ? "" : ` · ${formatDaysRemaining(contract.days_remaining)}`}`}
          eyebrow="العقود"
          menuItems={
            can("contracts.update")
              ? [
                  { id: "renew", label: "تجديد", onSelect: () => setRenewOpen(true) },
                  { id: "cancel", label: "إلغاء العقد", onSelect: () => setCancelOpen(true) },
                  { id: "terminate", label: "إنهاء مبكر", destructive: true, onSelect: () => setTerminateOpen(true) },
                ]
              : []
          }
          primaryAction={
            can("contracts.update") ? (
              <Button asChild className="rounded-full" variant="outline">
                <Link to={`/contracts/${contract.id}/edit`}>تعديل</Link>
              </Button>
            ) : null
          }
          title={title}
        />
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>الملخص المالي</CardTitle>
              <span className="text-sm font-medium text-muted-foreground">{formatCollectionStatus(contract.collection_status)}</span>
            </div>
          </CardHeader>
          <CardContent>
            <DetailGrid>
              <DetailItem important label="إجمالي المستحق" value={formatMoney(contract.total_due)} />
              <DetailItem important label="إجمالي المحصل" value={formatMoney(contract.total_paid)} />
              <DetailItem important label="المتبقي" value={formatMoney(contract.outstanding_amount)} />
              <DetailItem label="عدد الدفعات المتأخرة" value={formatNumber(contract.overdue_count ?? 0)} />
              <DetailItem label="المدة المتبقية" value={contract.days_remaining == null ? "—" : formatDaysRemaining(contract.days_remaining)} />
            </DetailGrid>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>بيانات العقد</CardTitle>
              <ContractStatusBadge endDate={contract.end_date} status={contract.status} />
            </div>
          </CardHeader>
          <CardContent>
            <DetailGrid>
              <DetailItem label="العقار" value={relationLabel(relations.propertyQuery.data?.name, "property")} />
              <DetailItem label="الوحدة" value={relationLabel(relations.unitQuery.data?.unit_number, "unit")} />
              <DetailItem label="المالك" value={relationLabel(relations.ownerQuery.data?.full_name, "owner")} />
              <DetailItem label="المستأجر" value={relationLabel(relations.tenantQuery.data?.full_name, "tenant")} />
              <DetailItem label="تاريخ البداية" value={formatDate(contract.start_date)} />
              <DetailItem label="تاريخ النهاية" value={formatDate(contract.end_date)} />
              <DetailItem important label="الإيجار" value={formatCurrency(parseMoney(contract.rent_value) ?? 0)} />
              <DetailItem label="دورية الدفع" value={contract.payment_frequency ? paymentFrequencyLabels[contract.payment_frequency] : "—"} />
              <DetailItem label="التأمين" value={contract.deposit_amount ? formatCurrency(parseMoney(contract.deposit_amount) ?? 0) : "—"} />
            </DetailGrid>
            {terms ? (
              <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-meta">الشروط</p>
                <p className="mt-2 leading-7 text-foreground">{terms}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <section className="space-y-3">
          <h2 className="text-section text-foreground">دفعات العقد</h2>
          {paymentsQuery.isError ? (
            <ErrorState compact description="يمكن متابعة تفاصيل العقد بدون جدول الدفعات." title="تعذر تحميل دفعات العقد" onRetry={() => void paymentsQuery.refetch()} />
          ) : (
            <DataTable
              actions={(row) => (
                <Button asChild className="rounded-full" size="sm" variant="ghost">
                  <Link to={`/payments/${row.id}`}>عرض</Link>
                </Button>
              )}
              columns={columns}
              data={paymentsQuery.data ?? []}
              emptyDescription="لا توجد دفعات مرتبطة بهذا العقد."
              emptyTitle="لا توجد دفعات"
              getRowId={(row) => row.id}
              loading={paymentsQuery.isPending}
            />
          )}
        </section>
        <AuditLogSection entityId={contract.id} entityType="contract" />
        <RenewalDialog
          currentEndDate={contract.end_date}
          isLoading={renewMutation.isPending}
          open={renewOpen}
          onOpenChange={setRenewOpen}
          onSubmit={async (values) => {
            await renewMutation.mutateAsync({ id: contract.id, payload: values });
          }}
        />
        <ConfirmDialog
          confirmLabel="إلغاء العقد"
          description={`هل أنت متأكد من إلغاء عقد «${title}»؟ سيصبح العقد مُلغى ولن يبقى سارياً.`}
          isLoading={cancelMutation.isPending}
          open={cancelOpen}
          title="إلغاء العقد"
          onConfirm={() => void cancelMutation.mutateAsync(contract.id).then(() => setCancelOpen(false))}
          onOpenChange={setCancelOpen}
        />
        <ConfirmDialog
          confirmLabel="إنهاء العقد"
          description={`هل أنت متأكد من إنهاء عقد «${title}» مبكرًا؟`}
          isLoading={terminateMutation.isPending}
          open={terminateOpen}
          title="إنهاء العقد مبكرًا"
          onConfirm={() => void terminateMutation.mutateAsync(contract.id).then(() => setTerminateOpen(false))}
          onOpenChange={setTerminateOpen}
        />
      </PageContainer>
    </motion.div>
  );
}
