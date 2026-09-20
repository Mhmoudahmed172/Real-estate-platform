import { motion } from "framer-motion";
import { DoorOpen } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { normalizeApiError } from "@/api/errors";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { UnitStatusBadge } from "@/components/ui/StatusBadge";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { useUnit, useUnitMutations, useUnitOperational, useUnitProperty } from "@/features/units/useUnits";
import { relationLabel } from "@/lib/display";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { formatMaintenanceStatusValue } from "@/lib/operationalLabels";
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
  const { can } = useAuthorization();
  const unitId = Number(id);
  const validId = Number.isFinite(unitId) ? unitId : undefined;
  const unitQuery = useUnit(validId);
  const operationalQuery = useUnitOperational(validId);
  const propertyQuery = useUnitProperty(unitQuery.data?.property_id);
  const { deleteMutation } = useUnitMutations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const unit = unitQuery.data;
  const operational = operationalQuery.data;

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
        <ErrorState description="تعذر تحميل تفاصيل الوحدة." title="تعذر تحميل الوحدة" onRetry={() => void unitQuery.refetch()} />
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
        <DetailHeader
          backLabel="العودة إلى الوحدات"
          backTo="/units"
          badges={
            <>
              <UnitStatusBadge status={unit.status} />
              {unit.unit_type ? <Badge variant="muted">{unit.unit_type}</Badge> : null}
            </>
          }
          description={relationLabel(propertyQuery.data?.name, "property")}
          eyebrow="ملف الوحدة"
          icon={
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <DoorOpen aria-hidden="true" className="size-5" />
            </span>
          }
          menuItems={can("units.delete") ? [{ id: "delete", label: "حذف", destructive: true, onSelect: () => setConfirmOpen(true) }] : []}
          primaryAction={
            <>
              {unit.status === "Available" && can("contracts.create") ? (
                <Button asChild className="rounded-full">
                  <Link to={`/contracts/new?property_id=${unit.property_id}&unit_id=${unit.id}`}>إنشاء عقد</Link>
                </Button>
              ) : null}
              {can("units.update") ? (
                <Button asChild className="rounded-full" variant="outline">
                  <Link to={`/units/${unit.id}/edit`}>تعديل</Link>
                </Button>
              ) : null}
            </>
          }
          title={unit.unit_number}
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <MetaItem label="قيمة الإيجار" value={formatCurrency(unit.rent_value)} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <MetaItem label="المستأجر الحالي" value={operational?.current_tenant?.full_name ?? "لا يوجد مستأجر حالي"} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <MetaItem label="العقد الحالي" value={operational?.active_contract ? `${formatDate(operational.active_contract.start_date)} — ${formatDate(operational.active_contract.end_date)}` : "لا يوجد عقد ساري"} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <MetaItem label="نهاية العقد" value={operational?.contract_end_date ? formatDate(operational.contract_end_date) : "—"} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <MetaItem label="تاريخ بداية الشغور" value={operational?.vacant_since ? formatDate(operational.vacant_since) : "—"} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <MetaItem label="مدة الشغور" value={unit.status !== "Available" ? "—" : operational?.vacancy_duration_days == null ? "مدة الشغور غير متوفرة" : `${formatNumber(operational.vacancy_duration_days)} يومًا`} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <MetaItem label="حالة الصيانة" value={formatMaintenanceStatusValue(operational?.maintenance_status)} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <MetaItem label="الدور" value={unit.floor == null ? "—" : formatNumber(unit.floor)} />
            </CardContent>
          </Card>
        </section>

        <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>المواصفات</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
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

        <ConfirmDialog
          confirmLabel="حذف الوحدة"
          description={deleteError ?? `هل أنت متأكد من حذف الوحدة «${unit.unit_number}»؟ لا يمكن التراجع عن هذا الإجراء.`}
          isLoading={deleteMutation.isPending}
          open={confirmOpen}
          title="حذف الوحدة"
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
