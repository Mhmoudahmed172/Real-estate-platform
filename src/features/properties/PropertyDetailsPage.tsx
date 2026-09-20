import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import type { ReactNode } from "react";
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
import { PropertyStatusBadge, UnitStatusBadge } from "@/components/ui/StatusBadge";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { useProperty, usePropertyMutations, usePropertyOwner, usePropertyUnits } from "@/features/properties/useProperties";
import { formatDisplayText, relationLabel } from "@/lib/display";
import { formatCurrency, formatNumber } from "@/lib/format";
import { propertyTypeLabels } from "@/lib/labels";
import { pageMotion } from "@/lib/motion";
import type { UnitOut } from "@/types/resources";

function MetaItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-meta">{label}</p>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

export function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const propertyId = Number(id);
  const validId = Number.isFinite(propertyId) ? propertyId : undefined;
  const propertyQuery = useProperty(validId);
  const unitsQuery = usePropertyUnits(validId);
  const ownerQuery = usePropertyOwner(propertyQuery.data?.owner_id);
  const { deleteMutation } = usePropertyMutations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const property = propertyQuery.data;
  const notes = formatDisplayText(property?.notes);
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
        <ErrorState description="تعذر تحميل تفاصيل العقار." title="تعذر تحميل العقار" onRetry={() => void propertyQuery.refetch()} />
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
        <DetailHeader
          backLabel="العودة إلى العقارات"
          backTo="/properties"
          badges={
            <>
              <PropertyStatusBadge status={property.status} />
              <Badge variant="muted">{propertyTypeLabels[property.property_type]}</Badge>
            </>
          }
          description={`${property.city ?? "بدون مدينة"}${property.address ? ` · ${property.address}` : ""}`}
          eyebrow="ملف العقار"
          icon={
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Building2 aria-hidden="true" className="size-5" />
            </span>
          }
          menuItems={can("properties.delete") ? [{ id: "delete", label: "حذف", destructive: true, onSelect: () => setConfirmOpen(true) }] : []}
          primaryAction={
            can("properties.update") ? (
              <Button asChild className="rounded-full" variant="outline">
                <Link to={`/properties/${property.id}/edit`}>تعديل</Link>
              </Button>
            ) : null
          }
          title={property.name}
        />

        <section className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <MetaItem label="عدد الوحدات" value={formatNumber(property.units_count)} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <MetaItem label="عدد الأدوار" value={property.floors_count == null ? "—" : formatNumber(property.floors_count)} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <MetaItem label="المالك" value={relationLabel(ownerQuery.data?.full_name, "owner")} />
            </CardContent>
          </Card>
        </section>

        <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
          {notes ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>ملاحظات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-foreground">{notes}</p>
              </CardContent>
            </Card>
          ) : (
            <div />
          )}
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
                <div className="grid gap-3">
                  <MetaItem label="الاسم" value={ownerQuery.data.full_name} />
                  <MetaItem label="الهاتف" value={<ContactLink type="phone" value={ownerQuery.data.phone} />} />
                  <MetaItem label="البريد" value={<ContactLink type="email" value={ownerQuery.data.email} />} />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-section text-foreground">الوحدات المرتبطة</h2>
          {unitsQuery.isError ? (
            <ErrorState compact description="تعذر تحميل وحدات العقار." title="تعذر تحميل الوحدات" onRetry={() => void unitsQuery.refetch()} />
          ) : (
            <DataTable
              actions={(row) => (
                <Button asChild className="rounded-full" size="sm" variant="ghost">
                  <Link to={`/units/${row.id}`}>عرض</Link>
                </Button>
              )}
              columns={unitColumns}
              data={unitsQuery.data ?? []}
              emptyDescription="لا توجد وحدات مرتبطة بهذا العقار."
              emptyTitle="لا توجد وحدات"
              getRowId={(row) => row.id}
              loading={unitsQuery.isPending}
            />
          )}
        </section>
        <ConfirmDialog
          confirmLabel="حذف العقار"
          description={deleteError ?? `هل أنت متأكد من حذف العقار «${property.name}»؟ لا يمكن التراجع عن هذا الإجراء.`}
          isLoading={deleteMutation.isPending}
          open={confirmOpen}
          title="حذف العقار"
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
