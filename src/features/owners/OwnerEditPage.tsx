import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useOwner, useOwnerMutations } from "@/features/owners/useOwners";
import { PartyForm } from "@/features/shared/PartyForm";
import { pageMotion } from "@/lib/motion";
import type { OwnerUpdate } from "@/types/resources";

export function OwnerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ownerId = Number(id);
  const validId = Number.isFinite(ownerId) ? ownerId : undefined;
  const ownerQuery = useOwner(validId);
  const { updateMutation } = useOwnerMutations();

  async function handleSubmit(payload: OwnerUpdate) {
    if (!validId) return;
    const updated = await updateMutation.mutateAsync({ id: validId, payload });
    navigate(`/owners/${updated.id}`);
  }

  if (ownerQuery.isPending) {
    return (
      <PageContainer>
        <LoadingState label="جاري تحميل المالك..." />
      </PageContainer>
    );
  }

  if (ownerQuery.isError || !ownerQuery.data) {
    return (
      <PageContainer>
        <ErrorState
          description="تعذر تحميل المالك المطلوب تعديله."
          title="تعذر تحميل المالك"
          onRetry={() => void ownerQuery.refetch()}
        />
      </PageContainer>
    );
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <div className="mx-auto w-full max-w-[800px] space-y-6">
          <PageHeader
            description="حدّث بيانات المالك ثم احفظ التعديلات."
            eyebrow="تعديل سجل"
            title={`تعديل ${ownerQuery.data.full_name}`}
          />
          <PartyForm
            defaultValues={ownerQuery.data}
            kind="owner"
            onCancelHref={`/owners/${ownerQuery.data.id}`}
            onSubmit={handleSubmit}
          />
        </div>
      </PageContainer>
    </motion.div>
  );
}
