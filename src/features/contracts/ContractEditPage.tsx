import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContractForm } from "@/features/contracts/ContractForm";
import { useContract, useContractMutations } from "@/features/contracts/useContracts";
import { pageMotion } from "@/lib/motion";
import type { ContractUpdate } from "@/types/resources";

export function ContractEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contractId = id ? Number(id) : undefined;
  const contractQuery = useContract(contractId);
  const { updateMutation } = useContractMutations();

  async function submit(payload: ContractUpdate) {
    if (!contractId) return;
    await updateMutation.mutateAsync({ id: contractId, payload });
    navigate(`/contracts/${contractId}`);
  }

  return <motion.div {...pageMotion}><PageContainer>
    <PageHeader eyebrow="العقود" title="تعديل العقد" description="تعديل الحقول التي يدعمها ContractUpdate فقط." />
    {contractQuery.isPending ? <LoadingState label="جاري تحميل العقد" /> : contractQuery.isError || !contractQuery.data ? <ErrorState title="تعذر تحميل العقد" description="لا يمكن فتح نموذج التعديل لهذا العقد." onRetry={() => void contractQuery.refetch()} /> : <ContractForm mode="edit" contract={contractQuery.data} properties={[]} owners={[]} tenants={[]} onSubmit={submit} onCancelHref={`/contracts/${contractQuery.data.id}`} />}
  </PageContainer></motion.div>;
}


