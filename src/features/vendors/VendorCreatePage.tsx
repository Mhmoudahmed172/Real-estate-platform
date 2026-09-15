import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { VendorForm } from "@/features/vendors/VendorForm";
import { useVendorMutations } from "@/features/vendors/useVendors";
import { pageMotion } from "@/lib/motion";
import type { VendorCreate } from "@/types/resources";
export function VendorCreatePage() { const navigate = useNavigate(); const { createMutation } = useVendorMutations(); async function submit(payload: VendorCreate) { const vendor = await createMutation.mutateAsync(payload); navigate(`/vendors/${vendor.id}`); } return <motion.div {...pageMotion}><PageContainer><PageHeader eyebrow="الموردون" title="إضافة مورد" description="إنشاء مورد باستخدام VendorCreate." /><VendorForm mode="create" onSubmit={(payload) => submit(payload as VendorCreate)} onCancelHref="/vendors" /></PageContainer></motion.div>; }
