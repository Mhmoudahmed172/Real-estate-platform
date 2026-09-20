import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { VendorForm } from "@/features/vendors/VendorForm";
import { useVendor, useVendorMutations } from "@/features/vendors/useVendors";
import { pageMotion } from "@/lib/motion";
import type { VendorUpdate } from "@/types/resources";
export function VendorEditPage() { const { id } = useParams(); const navigate = useNavigate(); const vendorId = id ? Number(id) : undefined; const vendorQuery = useVendor(vendorId); const { updateMutation } = useVendorMutations(); async function submit(payload: VendorUpdate) { if (!vendorId) return; await updateMutation.mutateAsync({ id: vendorId, payload }); navigate(`/vendors/${vendorId}`); } return <motion.div {...pageMotion}><PageContainer><PageHeader eyebrow="الموردون" title="تعديل المورد" description="تحديث بيانات المورد ووسائل التواصل والخدمات المقدمة." />{vendorQuery.isPending ? <LoadingState label="جاري تحميل المورد" /> : vendorQuery.isError || !vendorQuery.data ? <ErrorState title="تعذر تحميل المورد" description="لا يمكن فتح نموذج التعديل لهذا المورد." onRetry={() => void vendorQuery.refetch()} /> : <VendorForm mode="edit" vendor={vendorQuery.data} onSubmit={submit} onCancelHref={`/vendors/${vendorQuery.data.id}`} />}</PageContainer></motion.div>; }
