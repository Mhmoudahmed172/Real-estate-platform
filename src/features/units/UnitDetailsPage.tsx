import { motion } from "framer-motion";
import { ArrowRight, DoorOpen, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { normalizeApiError } from "@/api/errors";
import { Can } from "@/app/guards/Can";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { UnitStatusBadge } from "@/components/ui/StatusBadge";
import { useUnit, useUnitMutations, useUnitProperty } from "@/features/units/useUnits";
import { formatCurrency, formatNumber } from "@/lib/format";
import { unitStatusLabels } from "@/lib/labels";
import { pageMotion } from "@/lib/motion";

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-meta">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function UnitDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const unitId = Number(id);
  const validId = Number.isFinite(unitId) ? unitId : undefined;
  const unitQuery = useUnit(validId);
  const propertyQuery = useUnitProperty(unitQuery.data?.property_id);
  const { deleteMutation } = useUnitMutations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const unit = unitQuery.data;

  if (unitQuery.isPending) {
    return (
      <PageContainer>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-56 w-full" />
      </PageContainer>
    );
  }

  if (unitQuery.isError || !unit) {
    return (
      <PageContainer>
        <ErrorState
          description="تعذر تحميل تفاصيل الوحدة."
          title="تعذر تحميل الوحدة"
          onRetry={() => void unitQuery.refetch()}
        />
      </PageContainer>
    );
  }

  async function handleDelete() {
    if (!validId) return;
    try {
      await deleteMutation.mutateAsync(validId);
      navigate("/units");
    } catch (error) {
      setDeleteError(normalizeApiError(error).message);
    }
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <div>
          <Button asChild className="mb-3 h-8 px-2 text-muted-foreground" size="sm" variant="ghost">
            <Link to="/units">
              <ArrowRight aria-hidden="true" className="size-4" />
              العودة إلى الوحدات
            </Link>
          </Button>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <DoorOpen aria-hidden="true" className="size-6" />
              </span>
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold text-primary">ملف الوحدة</p>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-page text-foreground">{unit.unit_number}</h1>
                  <UnitStatusBadge status={unit.status} />
                  {unit.unit_type ? <Badge variant="muted">{unit.unit_type}</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {propertyQuery.data?.name ?? `عقار #${unit.property_id}`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Can permission="units.update">
                <Button asChild className="rounded-full" variant="outline">
                  <Link to={`/units/${unit.id}/edit`}>
                    <Pencil aria-hidden="true" className="size-4" />
                    تعديل
                  </Link>
                </Button>
              </Can>
              <Can permission="units.delete">
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
              <MetaItem label="قيمة الإيجار" value={formatCurrency(unit.rent_value)} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <MetaItem label="الدور" value={unit.floor == null ? "—" : formatNumber(unit.floor)} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <MetaItem label="الغرف" value={unit.rooms_count == null ? "—" : formatNumber(unit.rooms_count)} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <MetaItem label="المعرف" value={`#${unit.id}`} />
            </CardContent>
          </Card>
        </section>

        <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>البيانات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <MetaItem label="رقم الوحدة" value={unit.unit_number} />
              <MetaItem label="الحالة" value={unitStatusLabels[unit.status]} />
              <MetaItem label="نوع الوحدة" value={unit.unit_type ?? "—"} />
              <MetaItem label="المساحة" value={unit.area == null ? "—" : formatNumber(unit.area, 1)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>العقار المرتبط</CardTitle>
            </CardHeader>
            <CardContent>
              {propertyQuery.isPending ? (
                <Skeleton className="h-20 w-full" />
              ) : propertyQuery.isError || !propertyQuery.data ? (
                <ErrorState compact description="تعذر تحميل العقار المرتبط." title="تعذر تحميل العقار" />
              ) : (
                <div className="grid gap-4">
                  <MetaItem label="اسم العقار" value={propertyQuery.data.name} />
                  <MetaItem label="المدينة" value={propertyQuery.data.city ?? "—"} />
                  <Button asChild className="w-fit rounded-full" size="sm" variant="outline">
                    <Link to={`/properties/${propertyQuery.data.id}`}>عرض العقار</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {deleteError ? <p className="text-xs text-destructive">{deleteError}</p> : null}
        <ConfirmDialog
          description="سيتم حذف الوحدة إذا سمحت صلاحيات الخادم بذلك. لا يمكن التراجع عن هذا الإجراء من الواجهة."
          isLoading={deleteMutation.isPending}
          open={confirmOpen}
          title={`حذف الوحدة ${unit.unit_number}؟`}
          onConfirm={() => void handleDelete()}
          onOpenChange={setConfirmOpen}
        />
      </PageContainer>
    </motion.div>
  );
}
