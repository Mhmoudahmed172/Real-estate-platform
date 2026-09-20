import { motion } from "framer-motion";
import { Building2, UserRound } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ContactLink } from "@/components/ui/ContactLink";
import { ContractStatusBadge, PropertyStatusBadge } from "@/components/ui/StatusBadge";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { useOwner, useOwnerContracts, useOwnerMutations, useOwnerProperties, useOwnerSummary } from "@/features/owners/useOwners";
import { formatDisplayText, formatIdentity } from "@/lib/display";
import { formatCurrency, formatDate, formatMoney, formatNumber, formatPercent, parseMoney } from "@/lib/format";
import { propertyTypeLabels } from "@/lib/labels";
import { pageMotion } from "@/lib/motion";
import type { ContractOut, PropertyOut } from "@/types/resources";

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-meta">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function OwnerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const ownerId = Number(id);
  const validId = Number.isFinite(ownerId) ? ownerId : undefined;
  const ownerQuery = useOwner(validId);
  const summaryQuery = useOwnerSummary(validId);
  const propertiesQuery = useOwnerProperties(validId);
  const contractsQuery = useOwnerContracts(validId);
  const { deleteMutation } = useOwnerMutations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const owner = ownerQuery.data;
  const summary = summaryQuery.data;
  const identity = formatIdentity(owner?.national_id);

  const propertyColumns: Array<DataTableColumn<PropertyOut>> = [
    {
      id: "name",
      header: "العقار",
      cell: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Building2 aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{row.name}</p>
            <p className="text-meta">{row.city ?? "بدون مدينة"}</p>
          </div>
        </div>
      ),
    },
    { id: "type", header: "النوع", cell: (row) => propertyTypeLabels[row.property_type] },
    { id: "units", header: "الوحدات", numeric: true, cell: (row) => row.units_count },
    { id: "status", header: "الحالة", cell: (row) => <PropertyStatusBadge status={row.status} /> },
  ];
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

  if (ownerQuery.isPending) {
    return (
      <PageContainer>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-56 w-full" />
      </PageContainer>
    );
  }

  if (ownerQuery.isError || !owner) {
    return (
      <PageContainer>
        <ErrorState description="تعذر تحميل تفاصيل المالك." title="تعذر تحميل المالك" onRetry={() => void ownerQuery.refetch()} />
      </PageContainer>
    );
  }

  async function handleDelete() {
    if (!validId) return;
    try {
      await deleteMutation.mutateAsync(validId);
      navigate("/owners");
    } catch (error) {
      setDeleteError(normalizeApiError(error).message);
    }
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <DetailHeader
          backLabel="العودة إلى الملاك"
          backTo="/owners"
          badges={identity ? <Badge variant="muted">{identity}</Badge> : null}
          description={
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <ContactLink type="phone" value={owner.phone} />
              <ContactLink type="email" value={owner.email} />
            </div>
          }
          eyebrow="ملف المالك"
          icon={
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <UserRound aria-hidden="true" className="size-5" />
            </span>
          }
          menuItems={can("owners.delete") ? [{ id: "delete", label: "حذف", destructive: true, onSelect: () => setConfirmOpen(true) }] : []}
          primaryAction={
            can("owners.update") ? (
              <Button asChild className="rounded-full" variant="outline">
                <Link to={`/owners/${owner.id}/edit`}>تعديل</Link>
              </Button>
            ) : null
          }
          title={owner.full_name}
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card><CardContent className="pt-4"><MetaItem label="عدد العقارات" value={summaryQuery.isPending ? "..." : formatNumber(summary?.total_properties ?? 0)} /></CardContent></Card>
          <Card><CardContent className="pt-4"><MetaItem label="عدد الوحدات" value={summaryQuery.isPending ? "..." : formatNumber(summary?.total_units ?? 0)} /></CardContent></Card>
          <Card><CardContent className="pt-4"><MetaItem label="نسبة الإشغال" value={summaryQuery.isPending ? "..." : formatPercent(summary?.occupancy_rate ?? 0)} /></CardContent></Card>
          <Card><CardContent className="pt-4"><MetaItem label="الإيجارات المتوقعة" value={summaryQuery.isPending ? "..." : formatMoney(summary?.expected_rent)} /></CardContent></Card>
          <Card><CardContent className="pt-4"><MetaItem label="المحصل" value={summaryQuery.isPending ? "..." : formatMoney(summary?.collected_rent)} /></CardContent></Card>
          <Card><CardContent className="pt-4"><MetaItem label="المتبقي" value={summaryQuery.isPending ? "..." : formatMoney(summary?.outstanding)} /></CardContent></Card>
          <Card><CardContent className="pt-4"><MetaItem label="مصاريف الصيانة" value={summaryQuery.isPending ? "..." : formatMoney(summary?.maintenance_expenses)} /></CardContent></Card>
        </section>

        {formatDisplayText(owner.notes) ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>ملاحظات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-foreground">{formatDisplayText(owner.notes)}</p>
            </CardContent>
          </Card>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-section text-foreground">العقارات المرتبطة</h2>
          {propertiesQuery.isError ? (
            <ErrorState compact description="تعذر تحميل عقارات المالك." title="تعذر تحميل العقارات" />
          ) : (
            <DataTable
              actions={(row) => (
                <Button asChild className="rounded-full" size="sm" variant="ghost">
                  <Link to={`/properties/${row.id}`}>عرض</Link>
                </Button>
              )}
              columns={propertyColumns}
              data={propertiesQuery.data ?? []}
              emptyDescription="لا توجد عقارات مرتبطة بهذا المالك."
              emptyTitle="لا توجد عقارات"
              getRowId={(row) => row.id}
              loading={propertiesQuery.isPending}
            />
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-section text-foreground">العقود المرتبطة</h2>
          {contractsQuery.isError ? (
            <ErrorState compact description="تعذر تحميل عقود المالك." title="تعذر تحميل العقود" />
          ) : (contractsQuery.data ?? []).length === 0 && !contractsQuery.isPending ? (
            <EmptyState compact description="لا توجد عقود مرتبطة بهذا المالك." title="لا توجد عقود" />
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
          confirmLabel="حذف المالك"
          description={deleteError ?? `هل أنت متأكد من حذف المالك «${owner.full_name}»؟ لا يمكن التراجع عن هذا الإجراء.`}
          isLoading={deleteMutation.isPending}
          open={confirmOpen}
          title="حذف المالك"
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
