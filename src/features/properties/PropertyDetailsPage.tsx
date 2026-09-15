import { motion } from "framer-motion";
import { ArrowRight, Building2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PropertyStatusBadge, UnitStatusBadge } from "@/components/ui/StatusBadge";
import { useProperty, usePropertyMutations, usePropertyOwner, usePropertyUnits } from "@/features/properties/useProperties";
import { formatCurrency, formatNumber } from "@/lib/format";
import { propertyStatusLabels, propertyTypeLabels } from "@/lib/labels";
import { pageMotion } from "@/lib/motion";
import { normalizeApiError } from "@/api/errors";
import type { UnitOut } from "@/types/resources";

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-meta">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const propertyId = Number(id);
  const validId = Number.isFinite(propertyId) ? propertyId : undefined;
  const propertyQuery = useProperty(validId);
  const unitsQuery = usePropertyUnits(validId);
  const ownerQuery = usePropertyOwner(propertyQuery.data?.owner_id);
  const { deleteMutation } = usePropertyMutations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const property = propertyQuery.data;
  const unitColumns: Array<DataTableColumn<UnitOut>> = [
    { id: "number", header: "رقم الوحدة", cell: (row) => row.unit_number },
    { id: "type", header: "النوع", cell: (row) => row.unit_type ?? "—" },
    { id: "floor", header: "الدور", numeric: true, cell: (row) => row.floor ?? "—" },
    { id: "rooms", header: "الغرف", numeric: true, cell: (row) => row.rooms_count ?? "—" },
    { id: "area", header: "المساحة", numeric: true, cell: (row) => (row.area === null || row.area === undefined ? "—" : formatNumber(row.area, 1)) },
    { id: "rent", header: "قيمة الإيجار", numeric: true, cell: (row) => formatCurrency(row.rent_value) },
    { id: "status", header: "الحالة", cell: (row) => <UnitStatusBadge status={row.status} /> },
  ];

  if (propertyQuery.isPending) {
    return (
      <PageContainer>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-56 w-full" />
      </PageContainer>
    );
  }

  if (propertyQuery.isError || !property) {
    return (
      <PageContainer>
        <ErrorState
          description="تعذر تحميل تفاصيل العقار."
          title="تعذر تحميل العقار"
          onRetry={() => void propertyQuery.refetch()}
        />
      </PageContainer>
    );
  }

  async function handleDelete() {
    if (!validId) return;
    try {
      await deleteMutation.mutateAsync(validId);
      navigate("/properties");
    } catch (error) {
      setDeleteError(normalizeApiError(error).message);
    }
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <div>
          <Button asChild className="mb-3 h-8 px-2 text-muted-foreground" size="sm" variant="ghost">
            <Link to="/properties">
              <ArrowRight aria-hidden="true" className="size-4" />
              العودة إلى العقارات
            </Link>
          </Button>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Building2 aria-hidden="true" className="size-6" />
              </span>
              <div className="min-w-0 space-y-2">
                <p className="text-xs font-semibold text-primary">ملف العقار</p>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-page text-foreground">{property.name}</h1>
                  <PropertyStatusBadge status={property.status} />
                  <Badge variant="muted">{propertyTypeLabels[property.property_type]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {property.city ?? "بدون مدينة"}
                  {property.address ? ` · ${property.address}` : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="rounded-full" variant="outline">
                <Link to={`/properties/${property.id}/edit`}>
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
              <MetaItem label="عدد الوحدات" value={formatNumber(property.units_count)} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <MetaItem label="عدد الأدوار" value={property.floors_count == null ? "—" : formatNumber(property.floors_count)} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <MetaItem label="المعرف" value={`#${property.id}`} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <MetaItem label="المالك" value={ownerQuery.data?.full_name ?? (property.owner_id ? `#${property.owner_id}` : "غير مربوط")} />
            </CardContent>
          </Card>
        </section>

        <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>البيانات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <MetaItem label="النوع" value={propertyTypeLabels[property.property_type]} />
              <MetaItem label="الحالة" value={propertyStatusLabels[property.status]} />
              <MetaItem label="المدينة" value={property.city ?? "—"} />
              <MetaItem label="العنوان" value={property.address ?? "—"} />
              {property.notes ? (
                <div className="sm:col-span-2">
                  <MetaItem label="ملاحظات" value={property.notes} />
                </div>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>بيانات المالك</CardTitle>
            </CardHeader>
            <CardContent>
              {!property.owner_id ? (
                <EmptyState compact description="لم يُربط هذا العقار بمالك." title="لا يوجد مالك" />
              ) : ownerQuery.isPending ? (
                <Skeleton className="h-20 w-full" />
              ) : ownerQuery.isError || !ownerQuery.data ? (
                <ErrorState compact description="تعذر تحميل بيانات المالك." title="تعذر تحميل المالك" />
              ) : (
                <div className="grid gap-4">
                  <MetaItem label="الاسم" value={ownerQuery.data.full_name} />
                  <MetaItem label="الهاتف" value={ownerQuery.data.phone ?? "—"} />
                  <MetaItem label="البريد" value={ownerQuery.data.email ?? "—"} />
                  <MetaItem label="الهوية" value={ownerQuery.data.national_id ?? "—"} />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-section text-foreground">الوحدات المرتبطة</h2>
            <p className="text-meta">الوحدات المعادة من واجهة العقار</p>
          </div>
          {unitsQuery.isError ? (
            <ErrorState
              compact
              description="تعذر تحميل وحدات العقار."
              title="تعذر تحميل الوحدات"
              onRetry={() => void unitsQuery.refetch()}
            />
          ) : (
            <DataTable
              columns={unitColumns}
              data={unitsQuery.data ?? []}
              emptyDescription="لا توجد وحدات مرتبطة بهذا العقار."
              emptyTitle="لا توجد وحدات"
              getRowId={(row) => row.id}
              loading={unitsQuery.isPending}
            />
          )}
        </section>
        {deleteError ? <p className="text-xs text-destructive">{deleteError}</p> : null}
        <ConfirmDialog
          description="سيتم حذف العقار إذا سمحت صلاحيات الخادم بذلك. لا يمكن التراجع عن هذا الإجراء من الواجهة."
          isLoading={deleteMutation.isPending}
          open={confirmOpen}
          title={`حذف ${property.name}؟`}
          onConfirm={() => void handleDelete()}
          onOpenChange={setConfirmOpen}
        />
      </PageContainer>
    </motion.div>
  );
}
