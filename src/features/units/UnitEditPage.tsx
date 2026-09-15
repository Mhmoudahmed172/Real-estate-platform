import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { UnitForm } from "@/features/units/UnitForm";
import { usePropertiesOptions, useUnit, useUnitMutations } from "@/features/units/useUnits";
import { pageMotion } from "@/lib/motion";
import type { UnitCreate, UnitUpdate } from "@/types/resources";

export function UnitEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const unitId = Number(id);
  const validId = Number.isFinite(unitId) ? unitId : undefined;
  const unitQuery = useUnit(validId);
  const propertiesQuery = usePropertiesOptions();
  const { updateMutation } = useUnitMutations();

  async function handleSubmit(payload: UnitCreate & { status?: UnitUpdate["status"] }) {
    if (!validId) return;
    const updated = await updateMutation.mutateAsync({
      id: validId,
      payload: {
        unit_number: payload.unit_number,
        unit_type: payload.unit_type,
        area: payload.area,
        rooms_count: payload.rooms_count,
        floor: payload.floor,
        rent_value: payload.rent_value,
        status: payload.status,
      },
    });
    navigate(`/units/${updated.id}`);
  }

  if (unitQuery.isPending) {
    return (
      <PageContainer>
        <LoadingState label="جاري تحميل الوحدة..." />
      </PageContainer>
    );
  }

  if (unitQuery.isError || !unitQuery.data) {
    return (
      <PageContainer>
        <ErrorState
          description="تعذر تحميل الوحدة المطلوب تعديلها."
          title="تعذر تحميل الوحدة"
          onRetry={() => void unitQuery.refetch()}
        />
      </PageContainer>
    );
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <div className="mx-auto w-full max-w-[800px] space-y-6">
          <PageHeader
            description="حدّث بيانات الوحدة ثم احفظ التعديلات."
            eyebrow="تعديل سجل"
            title={`تعديل الوحدة ${unitQuery.data.unit_number}`}
          />
          <UnitForm
            defaultUnit={unitQuery.data}
            mode="edit"
            onCancelHref={`/units/${unitQuery.data.id}`}
            properties={propertiesQuery.data ?? []}
            onSubmit={handleSubmit}
          />
        </div>
      </PageContainer>
    </motion.div>
  );
}
