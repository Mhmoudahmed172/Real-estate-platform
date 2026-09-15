import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { MaintenanceForm } from "@/features/maintenance/MaintenanceForm";
import { useMaintenanceMutations, useMaintenanceOptions } from "@/features/maintenance/useMaintenance";
import { pageMotion } from "@/lib/motion";
import type { MaintenanceCreate } from "@/types/resources";

export function MaintenanceCreatePage() {
  const navigate = useNavigate();
  const { propertiesQuery, vendorsQuery } = useMaintenanceOptions();
  const { createMutation } = useMaintenanceMutations();
  async function submit(payload: MaintenanceCreate) { const request = await createMutation.mutateAsync(payload); navigate(`/maintenance/${request.id}`); }
  const failed = propertiesQuery.isError || vendorsQuery.isError;
  return <motion.div {...pageMotion}><PageContainer><PageHeader eyebrow="الصيانة" title="بلاغ صيانة جديد" description="إنشاء بلاغ باستخدام MaintenanceCreate فقط." />{failed ? <ErrorState title="تعذر تحميل بيانات النموذج" description="تحتاج الصفحة إلى العقارات والموردين." onRetry={() => { void propertiesQuery.refetch(); void vendorsQuery.refetch(); }} /> : <MaintenanceForm mode="create" properties={propertiesQuery.data ?? []} vendors={vendorsQuery.data ?? []} onSubmit={(payload) => submit(payload as MaintenanceCreate)} onCancelHref="/maintenance" />}</PageContainer></motion.div>;
}
