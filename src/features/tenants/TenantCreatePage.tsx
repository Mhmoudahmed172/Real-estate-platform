import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PartyForm } from "@/features/shared/PartyForm";
import { useTenantMutations } from "@/features/tenants/useTenants";
import { pageMotion } from "@/lib/motion";
import type { TenantCreate } from "@/types/resources";

export function TenantCreatePage() {
  const navigate = useNavigate();
  const { createMutation } = useTenantMutations();

  async function handleSubmit(payload: TenantCreate) {
    const created = await createMutation.mutateAsync(payload);
    navigate(`/tenants/${created.id}`);
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <div className="mx-auto w-full max-w-[800px] space-y-6">
          <PageHeader
            description="أدخل اسم المستأجر ووسائل التواصل ورقم الهوية."
            eyebrow="سجل حساب جديد"
            title="إضافة مستأجر"
          />
          <PartyForm kind="tenant" onCancelHref="/tenants" onSubmit={handleSubmit} />
        </div>
      </PageContainer>
    </motion.div>
  );
}
