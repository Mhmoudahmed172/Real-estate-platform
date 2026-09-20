import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { normalizeApiError } from "@/api/errors";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { DetailGrid, DetailItem } from "@/components/layout/DetailGrid";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ContactLink } from "@/components/ui/ContactLink";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { useService, useServiceMutations, useServiceRelations } from "@/features/services/useServices";
import { relationLabel } from "@/lib/display";
import { formatCurrency, formatDate } from "@/lib/format";
import { pageMotion } from "@/lib/motion";

export function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const serviceId = id ? Number(id) : undefined;
  const serviceQuery = useService(serviceId);
  const relations = useServiceRelations(serviceQuery.data);
  const { deleteMutation } = useServiceMutations();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (serviceQuery.isPending) return <LoadingState label="جاري تحميل الخدمة" />;
  if (serviceQuery.isError || !serviceQuery.data) {
    return <ErrorState description="لم نتمكن من تحميل تفاصيل الخدمة." title="تعذر تحميل الخدمة" onRetry={() => void serviceQuery.refetch()} />;
  }

  const service = serviceQuery.data;
  const vendor = relations.providerQuery.data;
  const propertyName = relationLabel(relations.propertyQuery.data?.name, "property");

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(service.id);
      navigate("/services");
    } catch (error) {
      setDeleteError(normalizeApiError(error).message);
    }
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <DetailHeader
          backLabel="العودة إلى الخدمات"
          backTo="/services"
          description={propertyName}
          eyebrow="الخدمات"
          menuItems={can("services.delete") ? [{ id: "delete", label: "حذف", destructive: true, onSelect: () => setDeleteOpen(true) }] : []}
          primaryAction={
            can("services.update") ? (
              <Button asChild className="rounded-full" variant="outline">
                <Link to={`/services/${service.id}/edit`}>تعديل</Link>
              </Button>
            ) : null
          }
          title={service.service_name}
        />
        <Card>
          <CardHeader>
            <CardTitle>بيانات الخدمة</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailGrid>
              <DetailItem label="العقار" value={propertyName} />
              <DetailItem label="المورد" value={service.provider_id ? relationLabel(vendor?.name, "vendor") : "بدون مورد"} />
              <DetailItem label="هاتف المورد" value={vendor?.phone ? <ContactLink type="phone" value={vendor.phone} /> : "—"} />
              <DetailItem label="بريد المورد" value={vendor?.email ? <ContactLink type="email" value={vendor.email} /> : "—"} />
              <DetailItem important label="التكلفة" value={service.cost == null ? null : formatCurrency(service.cost)} />
              <DetailItem label="تاريخ الاستحقاق" value={service.due_date ? formatDate(service.due_date) : null} />
            </DetailGrid>
          </CardContent>
        </Card>
        <ConfirmDialog
          confirmLabel="حذف الخدمة"
          description={deleteError ?? `هل أنت متأكد من حذف الخدمة «${service.service_name}»؟`}
          isLoading={deleteMutation.isPending}
          open={deleteOpen}
          title="حذف الخدمة"
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
