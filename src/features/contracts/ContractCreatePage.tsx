import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { PaymentStatusBadge } from "@/components/ui/StatusBadge";
import { ContractForm } from "@/features/contracts/ContractForm";
import { useContractMutations, useContractOptions } from "@/features/contracts/useContracts";
import { formatCurrency, formatDate, parseMoney } from "@/lib/format";
import { pageMotion } from "@/lib/motion";
import type { ContractCreate, PaymentOut } from "@/types/resources";

export function ContractCreatePage() {
  const navigate = useNavigate();
  const { propertiesQuery, ownersQuery, tenantsQuery } = useContractOptions();
  const { createMutation, previewMutation } = useContractMutations();
  const [preview, setPreview] = useState<PaymentOut[]>([]);

  async function submit(payload: ContractCreate) {
    const contract = await createMutation.mutateAsync(payload);
    navigate(`/contracts/${contract.id}`);
  }

  async function previewSchedule(payload: ContractCreate) {
    const schedule = await previewMutation.mutateAsync(payload);
    setPreview(schedule);
  }

  const columns: Array<DataTableColumn<PaymentOut>> = [
    { id: "due", header: "تاريخ الاستحقاق", cell: (row) => formatDate(row.due_date) },
    { id: "amount", header: "المبلغ", numeric: true, cell: (row) => formatCurrency(parseMoney(row.amount_due) ?? 0) },
    { id: "status", header: "الحالة", cell: (row) => <PaymentStatusBadge status={row.status} /> },
  ];

  const failed = propertiesQuery.isError || ownersQuery.isError || tenantsQuery.isError;
  return <motion.div {...pageMotion}><PageContainer>
    <PageHeader eyebrow="العقود" title="إنشاء عقد" description="إنشاء عقد جديد باستخدام ContractCreate ومعاينة جدول الدفعات من backend قبل الحفظ." />
    {failed ? <ErrorState title="تعذر تحميل بيانات النموذج" description="تحتاج صفحة العقد إلى العقارات والملاك والمستأجرين." onRetry={() => { void propertiesQuery.refetch(); void ownersQuery.refetch(); void tenantsQuery.refetch(); }} /> : <>
      <ContractForm mode="create" properties={propertiesQuery.data ?? []} owners={ownersQuery.data ?? []} tenants={tenantsQuery.data ?? []} onSubmit={(payload) => submit(payload as ContractCreate)} onPreview={previewSchedule} previewLoading={previewMutation.isPending} onCancelHref="/contracts" />
      {preview.length > 0 ? <section className="space-y-3"><h2 className="text-section text-foreground">معاينة جدول الدفعات</h2><DataTable columns={columns} data={preview} getRowId={(row) => row.id} emptyTitle="لا توجد دفعات في المعاينة" /></section> : null}
    </>}
  </PageContainer></motion.div>;
}
