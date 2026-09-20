import { motion } from "framer-motion";
import { UserRoundCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { normalizeApiError } from "@/api/errors";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ContactLink } from "@/components/ui/ContactLink";
import { ContractStatusBadge } from "@/components/ui/StatusBadge";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { useTenant, useTenantContracts, useTenantMutations, useTenantSummary } from "@/features/tenants/useTenants";
import { formatDisplayText, formatIdentity, relationLabel } from "@/lib/display";
import { formatCurrency, formatDate, formatMoney, formatNumber, parseMoney } from "@/lib/format";
import { pageMotion } from "@/lib/motion";
import type { ContractOut } from "@/types/resources";

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-meta">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function TenantDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const tenantId = Number(id);
  const validId = Number.isFinite(tenantId) ? tenantId : undefined;
  const tenantQuery = useTenant(validId);
  const summaryQuery = useTenantSummary(validId);
  const contractsQuery = useTenantContracts(validId);
  const { deleteMutation } = useTenantMutations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const tenant = tenantQuery.data;
  const identity = formatIdentity(tenant?.national_id);
  const notes = formatDisplayText(tenant?.notes);
  const contractColumns: Array<DataTableColumn<ContractOut>> = [
    { id: "period", header: "الفترة", cell: (row) => `${formatDate(row.start_date)} - ${formatDate(row.end_date)}` },
    {
      id: "rent",
      header: "الإيجار",
      numeric: true,
      cell: (row) => {
        const amount = parseMoney(row.rent_value);
        return amount == null ? row.rent_value : formatCurrency(amount);
      },
    },
    { id: "status", header: "الحالة", cell: (row) => <ContractStatusBadge endDate={row.end_date} status={row.status} /> },
  ];

  if (tenantQuery.isPending) {
    return (
      <PageContainer>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-56 w-full" />
      </PageContainer>
    );
  }

  if (tenantQuery.isError || !tenant) {
    return (
      <PageContainer>
        <ErrorState description="تعذر تحميل تفاصيل المستأجر." title="تعذر تحميل المستأجر" onRetry={() => void tenantQuery.refetch()} />
      </PageContainer>
    );
  }

  async function handleDelete() {
    if (!validId) return;
    try {
      await deleteMutation.mutateAsync(validId);
      navigate("/tenants");
    } catch (error) {
      setDeleteError(normalizeApiError(error).message);
    }
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <DetailHeader
          backLabel="العودة إلى المستأجرين"
          backTo="/tenants"
          badges={identity ? <Badge variant="muted">{identity}</Badge> : null}
          description={
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <ContactLink type="phone" value={tenant.phone} />
              <ContactLink type="email" value={tenant.email} />
            </div>
          }
          eyebrow="ملف المستأجر"
          icon={
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <UserRoundCheck aria-hidden="true" className="size-5" />
            </span>
          }
          menuItems={can("tenants.delete") ? [{ id: "delete", label: "حذف", destructive: true, onSelect: () => setConfirmOpen(true) }] : []}
          primaryAction={
            can("tenants.update") ? (
              <Button asChild className="rounded-full" variant="outline">
                <Link to={`/tenants/${tenant.id}/edit`}>تعديل</Link>
              </Button>
            ) : null
          }
          title={tenant.full_name}
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {summaryQuery.data?.active_contract ? (
            <>
              <Card><CardContent className="pt-4"><MetaItem label="الوحدة الحالية" value={summaryQuery.data.current_unit?.unit_number ?? relationLabel(null, "unit")} /></CardContent></Card>
              <Card><CardContent className="pt-4"><MetaItem label="العقد الساري" value={`${formatDate(summaryQuery.data.active_contract.start_date)} — ${formatDate(summaryQuery.data.active_contract.end_date)}`} /></CardContent></Card>
              <Card><CardContent className="pt-4"><MetaItem label="الرصيد المتبقي" value={formatMoney(summaryQuery.data.remaining_balance)} /></CardContent></Card>
              <Card><CardContent className="pt-4"><MetaItem label="الدفعة القادمة" value={summaryQuery.data.next_payment ? `${formatDate(summaryQuery.data.next_payment.due_date)} · ${formatMoney(summaryQuery.data.next_payment.remaining)}` : "لا توجد دفعة قادمة"} /></CardContent></Card>
              <Card><CardContent className="pt-4"><MetaItem label="عدد الدفعات المتأخرة" value={formatNumber(summaryQuery.data.overdue_payment_count)} /></CardContent></Card>
              <Card><CardContent className="pt-4"><MetaItem label="عدد بلاغات الصيانة" value={formatNumber(summaryQuery.data.maintenance_request_count)} /></CardContent></Card>
            </>
          ) : summaryQuery.isPending ? (
            <Card><CardContent className="pt-4"><MetaItem label="الحالة التشغيلية" value="..." /></CardContent></Card>
          ) : (
            <div className="sm:col-span-2 xl:col-span-3">
              <EmptyState compact description="لا يوجد عقد ساري مرتبط بهذا المستأجر حاليًا." title="لا يوجد عقد ساري" />
            </div>
          )}
        </section>

        {notes ? (
          <Card>
            <CardContent className="pt-4">
              <MetaItem label="ملاحظات" value={notes} />
            </CardContent>
          </Card>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-section text-foreground">العقود المرتبطة</h2>
          {contractsQuery.isError ? (
            <ErrorState compact description="تعذر تحميل عقود المستأجر." title="تعذر تحميل العقود" />
          ) : (contractsQuery.data ?? []).length === 0 && !contractsQuery.isPending ? (
            <EmptyState compact description="لا توجد عقود مرتبطة بهذا المستأجر." title="لا توجد عقود" />
          ) : (
            <DataTable
              actions={(row) => (
                <Button asChild className="rounded-full" size="sm" variant="ghost">
                  <Link to={`/contracts/${row.id}`}>عرض</Link>
                </Button>
              )}
              columns={contractColumns}
              data={contractsQuery.data ?? []}
              getRowId={(row) => row.id}
              loading={contractsQuery.isPending}
            />
          )}
        </section>

        <ConfirmDialog
          confirmLabel="حذف المستأجر"
          description={deleteError ?? `هل أنت متأكد من حذف المستأجر «${tenant.full_name}»؟ لا يمكن التراجع عن هذا الإجراء.`}
          isLoading={deleteMutation.isPending}
          open={confirmOpen}
          title="حذف المستأجر"
          onConfirm={() => void handleDelete()}
          onOpenChange={(open) => {
            setConfirmOpen(open);
            if (!open) setDeleteError(null);
          }}
        />
      </PageContainer>
    </motion.div>
  );
}
