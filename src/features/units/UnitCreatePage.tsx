import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { UnitForm } from "@/features/units/UnitForm";
import { usePropertiesOptions, useUnitMutations } from "@/features/units/useUnits";
import { pageMotion } from "@/lib/motion";
import type { UnitCreate } from "@/types/resources";

export function UnitCreatePage() {
  const navigate = useNavigate();
  const propertiesQuery = usePropertiesOptions();
  const { createMutation } = useUnitMutations();

  async function handleSubmit(payload: UnitCreate) {
    const created = await createMutation.mutateAsync({
      unit_number: payload.unit_number,
      unit_type: payload.unit_type,
      area: payload.area,
      rooms_count: payload.rooms_count,
      floor: payload.floor,
      rent_value: payload.rent_value,
      property_id: payload.property_id,
    });
    navigate(`/units/${created.id}`);
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <div className="mx-auto w-full max-w-[800px] space-y-6">
          <PageHeader
            description="أدخل بيانات الوحدة الأساسية واربطها بعقار موجود."
            eyebrow="سجل تشغيلي جديد"
            title="إضافة وحدة"
          />
          <UnitForm mode="create" onCancelHref="/units" properties={propertiesQuery.data ?? []} onSubmit={handleSubmit} />
        </div>
      </PageContainer>
    </motion.div>
  );
}
