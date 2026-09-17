import { motion } from "framer-motion";
import { ArrowRight, Building2, Pencil, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { normalizeApiError } from "@/api/errors";
import { Can } from "@/app/guards/Can";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ContractStatusBadge, PropertyStatusBadge } from "@/components/ui/StatusBadge";
import { useOwner, useOwnerContracts, useOwnerMutations, useOwnerProperties } from "@/features/owners/useOwners";
import { formatCurrency, formatDate, formatNumber, parseMoney } from "@/lib/format";
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
  const ownerId = Number(id);
  const validId = Number.isFinite(ownerId) ? ownerId : undefined;
  const ownerQuery = useOwner(validId);
  const propertiesQuery = useOwnerProperties(validId);
  const contractsQuery = useOwnerContracts(validId);
  const { deleteMutation } = useOwnerMutations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const owner = ownerQuery.data;
  const totalUnits = (propertiesQuery.data ?? []).reduce((sum, property) => sum + property.units_count, 0);

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
    { id: "contract", header: "العقد", cell: (row) => `#${row.id}` },
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
    { id: "status", header: "الحالة", cell: (row) => <ContractStatusBadge status={row.status} /> },
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
        <ErrorState
          description="تعذر تحميل تفاصيل المالك."
          title="تعذر تحميل المالك"
          onRetry={() => void ownerQuery.refetch()}
        />
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
        <div>
          <Button asChild className="mb-3 h-8 px-2 text-muted-foreground" size="sm" variant="ghost">
            <Link to="/owners">
              <ArrowRight aria-hidden="true" className="size-4" />
              العودة إلى الملاك
            </Link>
          </Button>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <UserRound aria-hidden="true" className="size-6" />
              </span>
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold text-primary">ملف المالك</p>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-page text-foreground">{owner.full_name}</h1>
                  {owner.national_id ? <Badge variant="muted">{owner.national_id}</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{owner.email ?? owner.phone ?? "لا توجد بيانات تواصل"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Can permission="owners.update">
                <Button asChild className="rounded-full" variant="outline">
                  <Link to={`/owners/${owner.id}/edit`}>
                    <Pencil aria-hidden="true" className="size-4" />
                    تعديل
                  </Link>
                </Button>
              </Can>
              <Can permission="owners.delete">
                <Button className="rounded-full" variant="destructive" onClick={() => setConfirmOpen(true)}>
                  <Trash2 aria-hidden="true" className="size-4" />
                  حذف
                </Button>
              </Can>
            </div>
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="pt-5">
              <MetaItem label="العقارات" value={propertiesQuery.isPending ? "..." : formatNumber((propertiesQuery.data ?? []).length)} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <MetaItem label="الوحدات عبر العقارات" value={propertiesQuery.isPending ? "..." : formatNumber(totalUnits)} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <MetaItem label="العقود المرتبطة" value={contractsQuery.isPending ? "..." : formatNumber((contractsQuery.data ?? []).length)} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <MetaItem label="المعرف" value={`#${owner.id}`} />
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>بيانات التواصل</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <MetaItem label="الهاتف" value={owner.phone ?? "—"} />
            <MetaItem label="البريد الإلكتروني" value={owner.email ?? "—"} />
            <MetaItem label="رقم الهوية" value={owner.national_id ?? "—"} />
            <MetaItem label="ملاحظات" value={owner.notes ?? "—"} />
          </CardContent>
        </Card>

        <section className="space-y-3">
          <div>
            <h2 className="text-section text-foreground">العقارات المرتبطة</h2>
            <p className="text-meta">عقارات المالك من endpoint الموثق.</p>
          </div>
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
          <div>
            <h2 className="text-section text-foreground">العقود المرتبطة</h2>
            <p className="text-meta">عرض قراءة فقط للعقود الموثقة للمالك دون تنفيذ Phase 4.</p>
          </div>
          {contractsQuery.isError ? (
            <ErrorState compact description="تعذر تحميل عقود المالك." title="تعذر تحميل العقود" />
          ) : (contractsQuery.data ?? []).length === 0 && !contractsQuery.isPending ? (
            <EmptyState compact description="لا توجد عقود مرتبطة بهذا المالك." title="لا توجد عقود" />
          ) : (
            <DataTable columns={contractColumns} data={contractsQuery.data ?? []} getRowId={(row) => row.id} loading={contractsQuery.isPending} />
          )}
        </section>

        {deleteError ? <p className="text-xs text-destructive">{deleteError}</p> : null}
        <ConfirmDialog
          description="سيتم حذف المالك إذا سمحت صلاحيات الخادم بذلك. لا يمكن التراجع عن هذا الإجراء من الواجهة."
          isLoading={deleteMutation.isPending}
          open={confirmOpen}
          title={`حذف ${owner.full_name}؟`}
          onConfirm={() => void handleDelete()}
          onOpenChange={setConfirmOpen}
        />
      </PageContainer>
    </motion.div>
  );
}

