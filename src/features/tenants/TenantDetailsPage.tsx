import { motion } from "framer-motion";
import { ArrowRight, Pencil, Trash2, UserRoundCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { normalizeApiError } from "@/api/errors";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ContractStatusBadge } from "@/components/ui/StatusBadge";
import { useTenant, useTenantContracts, useTenantMutations } from "@/features/tenants/useTenants";
import { formatCurrency, formatDate, formatNumber, parseMoney } from "@/lib/format";
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
  const tenantId = Number(id);
  const validId = Number.isFinite(tenantId) ? tenantId : undefined;
  const tenantQuery = useTenant(validId);
  const contractsQuery = useTenantContracts(validId);
  const { deleteMutation } = useTenantMutations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const tenant = tenantQuery.data;
  const contractColumns: Array<DataTableColumn<ContractOut>> = [
    { id: "contract", header: "العقد", cell: (row) => `#${row.id}` },
    { id: "unit", header: "الوحدة", cell: (row) => `#${row.unit_id}` },
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
        <ErrorState
          description="تعذر تحميل تفاصيل المستأجر."
          title="تعذر تحميل المستأجر"
          onRetry={() => void tenantQuery.refetch()}
        />
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
        <div>
          <Button asChild className="mb-3 h-8 px-2 text-muted-foreground" size="sm" variant="ghost">
            <Link to="/tenants">
              <ArrowRight aria-hidden="true" className="size-4" />
              العودة إلى المستأجرين
            </Link>
          </Button>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <UserRoundCheck aria-hidden="true" className="size-6" />
              </span>
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold text-primary">ملف المستأجر</p>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-page text-foreground">{tenant.full_name}</h1>
                  {tenant.national_id ? <Badge variant="muted">{tenant.national_id}</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{tenant.email ?? tenant.phone ?? "لا توجد بيانات تواصل"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="rounded-full" variant="outline">
                <Link to={`/tenants/${tenant.id}/edit`}>
                  <Pencil aria-hidden="true" className="size-4" />
                  تعديل
                </Link>
              </Button>
              <Button className="rounded-full" variant="destructive" onClick={() => setConfirmOpen(true)}>
                <Trash2 aria-hidden="true" className="size-4" />
                حذف
              </Button>
            </div>
          </div>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="pt-5">
              <MetaItem label="العقود المرتبطة" value={contractsQuery.isPending ? "..." : formatNumber((contractsQuery.data ?? []).length)} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <MetaItem label="الهاتف" value={tenant.phone ?? "—"} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <MetaItem label="البريد" value={tenant.email ?? "—"} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <MetaItem label="المعرف" value={`#${tenant.id}`} />
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>بيانات المستأجر</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <MetaItem label="الاسم الكامل" value={tenant.full_name} />
            <MetaItem label="رقم الهوية" value={tenant.national_id ?? "—"} />
            <MetaItem label="الهاتف" value={tenant.phone ?? "—"} />
            <MetaItem label="البريد الإلكتروني" value={tenant.email ?? "—"} />
            <div className="sm:col-span-2">
              <MetaItem label="ملاحظات" value={tenant.notes ?? "—"} />
            </div>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <div>
            <h2 className="text-section text-foreground">العقود المرتبطة</h2>
            <p className="text-meta">عرض قراءة فقط للعقود الموثقة للمستأجر دون تنفيذ Phase 4.</p>
          </div>
          {contractsQuery.isError ? (
            <ErrorState compact description="تعذر تحميل عقود المستأجر." title="تعذر تحميل العقود" />
          ) : (contractsQuery.data ?? []).length === 0 && !contractsQuery.isPending ? (
            <EmptyState compact description="لا توجد عقود مرتبطة بهذا المستأجر." title="لا توجد عقود" />
          ) : (
            <DataTable columns={contractColumns} data={contractsQuery.data ?? []} getRowId={(row) => row.id} loading={contractsQuery.isPending} />
          )}
        </section>

        {deleteError ? <p className="text-xs text-destructive">{deleteError}</p> : null}
        <ConfirmDialog
          description="سيتم حذف المستأجر إذا سمحت صلاحيات الخادم بذلك. لا يمكن التراجع عن هذا الإجراء من الواجهة."
          isLoading={deleteMutation.isPending}
          open={confirmOpen}
          title={`حذف ${tenant.full_name}؟`}
          onConfirm={() => void handleDelete()}
          onOpenChange={setConfirmOpen}
        />
      </PageContainer>
    </motion.div>
  );
}
