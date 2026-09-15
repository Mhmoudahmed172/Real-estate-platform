import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PropertyForm } from "@/features/properties/PropertyForm";
import { useOwnersOptions, useProperty, usePropertyMutations } from "@/features/properties/useProperties";
import { pageMotion } from "@/lib/motion";
import type { PropertyCreate, PropertyUpdate } from "@/types/resources";

export function PropertyEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const propertyId = Number(id);
  const validId = Number.isFinite(propertyId) ? propertyId : undefined;
  const propertyQuery = useProperty(validId);
  const ownersQuery = useOwnersOptions();
  const { updateMutation } = usePropertyMutations();

  async function handleSubmit(payload: PropertyCreate & { status?: PropertyUpdate["status"] }) {
    if (!validId) return;
    const updated = await updateMutation.mutateAsync({
      id: validId,
      payload: {
        name: payload.name,
        property_type: payload.property_type,
        address: payload.address,
        city: payload.city,
        floors_count: payload.floors_count,
        owner_id: payload.owner_id,
        notes: payload.notes,
        status: payload.status,
      },
    });
    navigate(`/properties/${updated.id}`);
  }

  if (propertyQuery.isPending) {
    return (
      <PageContainer>
        <LoadingState label="جاري تحميل العقار..." />
      </PageContainer>
    );
  }

  if (propertyQuery.isError || !propertyQuery.data) {
    return (
      <PageContainer>
        <ErrorState
          description="تعذر تحميل العقار المطلوب تعديله."
          title="تعذر تحميل العقار"
          onRetry={() => void propertyQuery.refetch()}
        />
      </PageContainer>
    );
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <div className="mx-auto w-full max-w-[800px] space-y-6">
          <PageHeader
            description="حدّث بيانات العقار ثم احفظ التعديلات."
            eyebrow="تعديل سجل"
            title={`تعديل ${propertyQuery.data.name}`}
          />
          <PropertyForm
            defaultProperty={propertyQuery.data}
            mode="edit"
            onCancelHref={`/properties/${propertyQuery.data.id}`}
            owners={ownersQuery.data ?? []}
            onSubmit={handleSubmit}
          />
        </div>
      </PageContainer>
    </motion.div>
  );
}
