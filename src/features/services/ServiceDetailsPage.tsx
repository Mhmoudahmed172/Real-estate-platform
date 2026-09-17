import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Can } from "@/app/guards/Can";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useService, useServiceMutations, useServiceRelations } from "@/features/services/useServices";
import { formatCurrency, formatDate } from "@/lib/format";
import { pageMotion } from "@/lib/motion";

function DetailItem({ label, value }: { label: string; value: string | number | null | undefined }) { return <div className="rounded-xl border border-border bg-muted/30 px-4 py-3"><p className="text-meta">{label}</p><p className="mt-1 font-medium text-foreground">{value ?? "—"}</p></div>; }
export function ServiceDetailsPage() { const { id } = useParams(); const navigate = useNavigate(); const serviceId = id ? Number(id) : undefined; const serviceQuery = useService(serviceId); const relations = useServiceRelations(serviceQuery.data); const { deleteMutation } = useServiceMutations(); const [deleteOpen, setDeleteOpen] = useState(false); if (serviceQuery.isPending) return <LoadingState label="جاري تحميل الخدمة" />; if (serviceQuery.isError || !serviceQuery.data) return <ErrorState title="تعذر تحميل الخدمة" description="لم نتمكن من تحميل تفاصيل الخدمة." onRetry={() => void serviceQuery.refetch()} />; const service = serviceQuery.data; return <motion.div {...pageMotion}><PageContainer><PageHeader eyebrow="الخدمات" title={service.service_name} description="تفاصيل الخدمة والعلاقات المدعومة." actions={<div className="flex flex-wrap gap-2"><Can permission="services.update"><Button asChild className="rounded-full" variant="outline"><Link to={`/services/${service.id}/edit`}>تعديل</Link></Button></Can><Can permission="services.delete"><Button className="rounded-full" variant="destructive" onClick={() => setDeleteOpen(true)}>حذف</Button></Can></div>} /><Card><CardHeader><CardTitle>بيانات الخدمة</CardTitle></CardHeader><CardContent><div className="grid gap-3 md:grid-cols-2"><DetailItem label="العقار" value={relations.propertyQuery.data?.name ?? `#${service.property_id}`} /><DetailItem label="المورد" value={relations.providerQuery.data?.name ?? (service.provider_id ? `#${service.provider_id}` : null)} /><DetailItem label="التكلفة" value={service.cost == null ? null : formatCurrency(service.cost)} /><DetailItem label="تاريخ الاستحقاق" value={service.due_date ? formatDate(service.due_date) : null} /></div></CardContent></Card><ConfirmDialog open={deleteOpen} title="حذف الخدمة" description="سيتم حذف الخدمة عبر DELETE /services/{service_id}." confirmLabel="حذف الخدمة" isLoading={deleteMutation.isPending} onOpenChange={setDeleteOpen} onConfirm={() => void deleteMutation.mutateAsync(service.id).then(() => navigate("/services"))} /></PageContainer></motion.div>; }
