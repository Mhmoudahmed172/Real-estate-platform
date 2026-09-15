import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PartyForm } from "@/features/shared/PartyForm";
import { useTenant, useTenantMutations } from "@/features/tenants/useTenants";
import { pageMotion } from "@/lib/motion";
import type { TenantUpdate } from "@/types/resources";

export function TenantEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tenantId = Number(id);
  const validId = Number.isFinite(tenantId) ? tenantId : undefined;
  const tenantQuery = useTenant(validId);
  const { updateMutation } = useTenantMutations();

  async function handleSubmit(payload: TenantUpdate) {
    if (!validId) return;
    const updated = await updateMutation.mutateAsync({ id: validId, payload });
    navigate(`/tenants/${updated.id}`);
  }

  if (tenantQuery.isPending) {
    return (
      <PageContainer>
        <LoadingState label="جاري تحميل المستأجر..." />
      </PageContainer>
    );
  }

  if (tenantQuery.isError || !tenantQuery.data) {
    return (
      <PageContainer>
        <ErrorState
          description="تعذر تحميل المستأجر المطلوب تعديله."
          title="تعذر تحميل المستأجر"
          onRetry={() => void tenantQuery.refetch()}
        />
      </PageContainer>
    );
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <div className="mx-auto w-full max-w-[800px] space-y-6">
          <PageHeader
            description="حدّث بيانات المستأجر ثم احفظ التعديلات."
            eyebrow="تعديل سجل"
            title={`تعديل ${tenantQuery.data.full_name}`}
          />
          <PartyForm
            defaultValues={tenantQuery.data}
            kind="tenant"
            onCancelHref={`/tenants/${tenantQuery.data.id}`}
            onSubmit={handleSubmit}
          />
        </div>
      </PageContainer>
    </motion.div>
  );
}
