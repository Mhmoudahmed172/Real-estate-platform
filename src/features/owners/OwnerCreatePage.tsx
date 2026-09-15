import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PartyForm } from "@/features/shared/PartyForm";
import { useOwnerMutations } from "@/features/owners/useOwners";
import { pageMotion } from "@/lib/motion";
import type { OwnerCreate } from "@/types/resources";

export function OwnerCreatePage() {
  const navigate = useNavigate();
  const { createMutation } = useOwnerMutations();

  async function handleSubmit(payload: OwnerCreate) {
    const created = await createMutation.mutateAsync(payload);
    navigate(`/owners/${created.id}`);
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <div className="mx-auto w-full max-w-[800px] space-y-6">
          <PageHeader
            description="أدخل بيانات المالك ووسائل التواصل المتاحة في عقد الواجهة."
            eyebrow="سجل حساب جديد"
            title="إضافة مالك"
          />
          <PartyForm kind="owner" onCancelHref="/owners" onSubmit={handleSubmit} />
        </div>
      </PageContainer>
    </motion.div>
  );
}
