import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaintenanceForm } from "@/features/maintenance/MaintenanceForm";
import { useMaintenanceMutations, useMaintenanceOptions, useMaintenanceRequest } from "@/features/maintenance/useMaintenance";
import { pageMotion } from "@/lib/motion";
import type { MaintenanceUpdate } from "@/types/resources";

export function MaintenanceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const requestId = id ? Number(id) : undefined;
  const requestQuery = useMaintenanceRequest(requestId);
  const { propertiesQuery, vendorsQuery } = useMaintenanceOptions();
  const { updateMutation } = useMaintenanceMutations();
  async function submit(payload: MaintenanceUpdate) { if (!requestId) return; await updateMutation.mutateAsync({ id: requestId, payload }); navigate(`/maintenance/${requestId}`); }
  return <motion.div {...pageMotion}><PageContainer><PageHeader eyebrow="الصيانة" title="تعديل بلاغ الصيانة" description="تعديل الحقول التي يدعمها MaintenanceUpdate فقط." />{requestQuery.isPending ? <LoadingState label="جاري تحميل البلاغ" /> : requestQuery.isError || !requestQuery.data ? <ErrorState title="تعذر تحميل البلاغ" description="لا يمكن فتح نموذج التعديل لهذا البلاغ." onRetry={() => void requestQuery.refetch()} /> : <MaintenanceForm mode="edit" request={requestQuery.data} properties={propertiesQuery.data ?? []} vendors={vendorsQuery.data ?? []} onSubmit={submit} onCancelHref={`/maintenance/${requestQuery.data.id}`} />}</PageContainer></motion.div>;
}
