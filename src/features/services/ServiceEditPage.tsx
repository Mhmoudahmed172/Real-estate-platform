import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServiceForm } from "@/features/services/ServiceForm";
import { useService, useServiceMutations, useServiceOptions } from "@/features/services/useServices";
import { pageMotion } from "@/lib/motion";
import type { ServiceUpdate } from "@/types/resources";

export function ServiceEditPage() { const { id } = useParams(); const navigate = useNavigate(); const serviceId = id ? Number(id) : undefined; const serviceQuery = useService(serviceId); const { propertiesQuery, vendorsQuery } = useServiceOptions(); const { updateMutation } = useServiceMutations(); async function submit(payload: ServiceUpdate) { if (!serviceId) return; await updateMutation.mutateAsync({ id: serviceId, payload }); navigate(`/services/${serviceId}`); } return <motion.div {...pageMotion}><PageContainer><PageHeader eyebrow="الخدمات" title="تعديل الخدمة" description="تحديث اسم الخدمة والمورد والتكلفة وتاريخ الاستحقاق." />{serviceQuery.isPending ? <LoadingState label="جاري تحميل الخدمة" /> : serviceQuery.isError || !serviceQuery.data ? <ErrorState title="تعذر تحميل الخدمة" description="لا يمكن فتح نموذج التعديل لهذه الخدمة." onRetry={() => void serviceQuery.refetch()} /> : <ServiceForm mode="edit" service={serviceQuery.data} properties={propertiesQuery.data ?? []} vendors={vendorsQuery.data ?? []} onSubmit={submit} onCancelHref={`/services/${serviceQuery.data.id}`} />}</PageContainer></motion.div>; }
