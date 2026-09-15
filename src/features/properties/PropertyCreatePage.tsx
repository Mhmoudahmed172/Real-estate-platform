import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PropertyForm } from "@/features/properties/PropertyForm";
import { useOwnersOptions, usePropertyMutations } from "@/features/properties/useProperties";
import { pageMotion } from "@/lib/motion";
import type { PropertyCreate } from "@/types/resources";
import { useNavigate } from "react-router-dom";

export function PropertyCreatePage() {
  const navigate = useNavigate();
  const ownersQuery = useOwnersOptions();
  const { createMutation } = usePropertyMutations();

  async function handleSubmit(payload: PropertyCreate & { status?: unknown }) {
    const created = await createMutation.mutateAsync({
      name: payload.name,
      property_type: payload.property_type,
      address: payload.address,
      city: payload.city,
      floors_count: payload.floors_count,
      owner_id: payload.owner_id,
      notes: payload.notes,
    });
    navigate(created ? `/properties/${created.id}` : "/properties");
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <div className="mx-auto w-full max-w-[800px] space-y-6">
          <PageHeader
            description="أدخل بيانات العقار الأساسية ثم احفظ السجل."
            eyebrow="سجل تشغيلي جديد"
            title="إضافة عقار"
          />
          <PropertyForm mode="create" onCancelHref="/properties" owners={ownersQuery.data ?? []} onSubmit={handleSubmit} />
        </div>
      </PageContainer>
    </motion.div>
  );
}
