import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServiceForm } from "@/features/services/ServiceForm";
import { useServiceMutations, useServiceOptions } from "@/features/services/useServices";
import { pageMotion } from "@/lib/motion";
import type { ServiceCreate } from "@/types/resources";

export function ServiceCreatePage() { const navigate = useNavigate(); const { propertiesQuery, vendorsQuery } = useServiceOptions(); const { createMutation } = useServiceMutations(); async function submit(payload: ServiceCreate) { const service = await createMutation.mutateAsync(payload); navigate(`/services/${service.id}`); } const failed = propertiesQuery.isError || vendorsQuery.isError; return <motion.div {...pageMotion}><PageContainer><PageHeader eyebrow="الخدمات" title="إضافة خدمة" description="إنشاء خدمة باستخدام ServiceCreate." />{failed ? <ErrorState title="تعذر تحميل بيانات النموذج" description="تحتاج الصفحة إلى العقارات والموردين." onRetry={() => { void propertiesQuery.refetch(); void vendorsQuery.refetch(); }} /> : <ServiceForm mode="create" properties={propertiesQuery.data ?? []} vendors={vendorsQuery.data ?? []} onSubmit={(payload) => submit(payload as ServiceCreate)} onCancelHref="/services" />}</PageContainer></motion.div>; }
