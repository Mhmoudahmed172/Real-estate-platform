import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { normalizeApiError } from "@/api/errors";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { DetailGrid, DetailItem } from "@/components/layout/DetailGrid";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ContactLink } from "@/components/ui/ContactLink";
import { MaintenancePriorityBadge, MaintenanceStatusBadge } from "@/components/ui/StatusBadge";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { useVendor, useVendorMaintenance, useVendorMutations, useVendorStats } from "@/features/vendors/useVendors";
import { formatDisplayText } from "@/lib/display";
import { formatCurrency, formatDurationHours, formatNumber } from "@/lib/format";
import { pageMotion } from "@/lib/motion";
import type { MaintenanceOut } from "@/types/resources";

export function VendorDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const vendorId = id ? Number(id) : undefined;
  const vendorQuery = useVendor(vendorId);
  const statsQuery = useVendorStats(vendorId);
  const jobsQuery = useVendorMaintenance(vendorId);
  const { deleteMutation } = useVendorMutations();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const columns: Array<DataTableColumn<MaintenanceOut>> = [
    { id: "issue", header: "البلاغ", cell: (row) => row.issue_type },
    { id: "priority", header: "الأولوية", cell: (row) => (row.priority ? <MaintenancePriorityBadge priority={row.priority} /> : "—") },
    { id: "status", header: "الحالة", cell: (row) => <MaintenanceStatusBadge status={row.status} /> },
    { id: "cost", header: "التكلفة", numeric: true, cell: (row) => formatCurrency(row.cost) },
  ];

  if (vendorQuery.isPending) return <LoadingState label="جاري تحميل المورد" />;
  if (vendorQuery.isError || !vendorQuery.data) {
    return <ErrorState description="لم نتمكن من تحميل تفاصيل المورد." title="تعذر تحميل المورد" onRetry={() => void vendorQuery.refetch()} />;
  }

  const vendor = vendorQuery.data;
  const notes = formatDisplayText(vendor.notes);
  const services = formatDisplayText(vendor.services_provided);

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(vendor.id);
      navigate("/vendors");
    } catch (error) {
      setDeleteError(normalizeApiError(error).message);
    }
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <DetailHeader
          backLabel="العودة إلى الموردين"
          backTo="/vendors"
          description={
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <ContactLink type="phone" value={vendor.phone} />
              <ContactLink type="email" value={vendor.email} />
            </div>
          }
          eyebrow="الموردون"
          icon={
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Truck aria-hidden="true" className="size-5" />
            </span>
          }
          menuItems={can("vendors.delete") ? [{ id: "delete", label: "حذف", destructive: true, onSelect: () => setDeleteOpen(true) }] : []}
          primaryAction={
            can("vendors.update") ? (
              <Button asChild className="rounded-full" variant="outline">
                <Link to={`/vendors/${vendor.id}/edit`}>تعديل</Link>
              </Button>
            ) : null
          }
          title={vendor.name}
        />
        <section className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-4">
              <p className="text-meta">عدد البلاغات المكتملة</p>
              <p className="mt-1 font-numeric text-lg font-semibold">{statsQuery.isPending ? "..." : formatNumber(statsQuery.data?.completed_request_count ?? 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-meta">إجمالي تكلفة الأعمال</p>
              <p className="mt-1 font-numeric text-lg font-semibold">{statsQuery.isPending ? "..." : formatCurrency(statsQuery.data?.total_maintenance_cost ?? 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-meta">متوسط وقت التنفيذ</p>
              <p className="mt-1 font-numeric text-lg font-semibold">{statsQuery.isPending ? "..." : statsQuery.data?.average_completion_hours == null ? "غير متوفر" : formatDurationHours(statsQuery.data.average_completion_hours)}</p>
            </CardContent>
          </Card>
        </section>
        {services || notes ? (
          <Card>
            <CardHeader>
              <CardTitle>بيانات المورد</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailGrid>
                <DetailItem label="الخدمات المقدمة" value={services} />
                <DetailItem label="ملاحظات" value={notes} />
              </DetailGrid>
            </CardContent>
          </Card>
        ) : null}
        <section className="space-y-3">
          <h2 className="text-section text-foreground">بلاغات المورد</h2>
          {jobsQuery.isError ? (
            <ErrorState compact description="يمكن متابعة بيانات المورد بدون هذا القسم." title="تعذر تحميل بلاغات المورد" onRetry={() => void jobsQuery.refetch()} />
          ) : (
            <DataTable
              actions={(row) => (
                <Button asChild className="rounded-full" size="sm" variant="ghost">
                  <Link to={`/maintenance/${row.id}`}>عرض</Link>
                </Button>
              )}
              columns={columns}
              data={jobsQuery.data ?? []}
              emptyDescription="لا توجد بلاغات صيانة مرتبطة بهذا المورد."
              emptyTitle="لا توجد بلاغات"
              getRowId={(row) => row.id}
              loading={jobsQuery.isPending}
            />
          )}
        </section>
        <ConfirmDialog
          confirmLabel="حذف المورد"
          description={deleteError ?? `هل أنت متأكد من حذف المورد «${vendor.name}»؟`}
          isLoading={deleteMutation.isPending}
          open={deleteOpen}
          title="حذف المورد"
          onConfirm={() => void handleDelete()}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) setDeleteError(null);
          }}
        />
      </PageContainer>
    </motion.div>
  );
}
