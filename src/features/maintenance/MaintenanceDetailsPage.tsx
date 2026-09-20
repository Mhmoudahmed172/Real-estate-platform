import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Can } from "@/app/guards/Can";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { FormField } from "@/components/forms/FormField";
import { DetailGrid, DetailItem } from "@/components/layout/DetailGrid";
import { JsonPreview } from "@/components/layout/JsonPreview";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { MaintenancePriorityBadge, MaintenanceStatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/Textarea";
import { maintenanceAssignSchema, maintenanceTransitionSchema, type MaintenanceAssignValues, type MaintenanceTransitionValues } from "@/features/maintenance/maintenanceSchema";
import { useMaintenanceHistory, useMaintenanceMutations, useMaintenanceOptions, useMaintenanceRelations, useMaintenanceRequest } from "@/features/maintenance/useMaintenance";
import { applyApiFieldErrors } from "@/lib/formErrors";
import { formatCurrency, formatDate } from "@/lib/format";
import { maintenanceStatusLabels } from "@/lib/labels";
import { pageMotion } from "@/lib/motion";
import type { SelectOption } from "@/types/api";
import { maintenanceStatuses } from "@/types/resources";

type AssignDialogProps = { open: boolean; vendors: SelectOption[]; isLoading: boolean; onOpenChange: (open: boolean) => void; onSubmit: (values: MaintenanceAssignValues) => Promise<void> };
type TransitionDialogProps = { open: boolean; isLoading: boolean; onOpenChange: (open: boolean) => void; onSubmit: (values: MaintenanceTransitionValues) => Promise<void> };


function AssignDialog({ open, vendors, isLoading, onOpenChange, onSubmit }: AssignDialogProps) {
  const form = useForm<MaintenanceAssignValues>({ resolver: zodResolver(maintenanceAssignSchema), defaultValues: { vendor_id: 0 } });
  async function submit(values: MaintenanceAssignValues) { try { await onSubmit(values); form.reset(); onOpenChange(false); } catch (error) { const apiError = applyApiFieldErrors(error, form.setError); form.setError("root", { message: apiError.message }); } }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>إسناد البلاغ</DialogTitle><DialogDescription>اختر المورد المطلوب حسب Assignment.vendor_id.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(event) => void form.handleSubmit(submit)(event)}><FormField error={form.formState.errors.vendor_id?.message} label="المورد" required><Select value={form.watch("vendor_id") ? String(form.watch("vendor_id")) : ""} onValueChange={(value) => form.setValue("vendor_id", Number(value), { shouldValidate: true })}><SelectTrigger><SelectValue placeholder="اختر المورد" /></SelectTrigger><SelectContent>{vendors.map((vendor) => <SelectItem key={vendor.id} value={String(vendor.id)}>{vendor.label}</SelectItem>)}</SelectContent></Select></FormField>{form.formState.errors.root?.message ? <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p> : null}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button><Button isLoading={isLoading} type="submit">إسناد</Button></div></form></DialogContent></Dialog>;
}

function TransitionDialog({ open, isLoading, onOpenChange, onSubmit }: TransitionDialogProps) {
  const form = useForm<MaintenanceTransitionValues>({ resolver: zodResolver(maintenanceTransitionSchema), defaultValues: { status: "InProgress", note: "", cost: null, execution_date: "" } });
  async function submit(values: MaintenanceTransitionValues) { try { await onSubmit(values); form.reset(); onOpenChange(false); } catch (error) { const apiError = applyApiFieldErrors(error, form.setError); form.setError("root", { message: apiError.message }); } }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>تحديث حالة البلاغ</DialogTitle><DialogDescription>يستخدم هذا الإجراء endpoint انتقال الحالة المنفصل.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(event) => void form.handleSubmit(submit)(event)}><div className="grid gap-4 md:grid-cols-2"><FormField error={form.formState.errors.status?.message} label="الحالة" required><Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as MaintenanceTransitionValues["status"], { shouldValidate: true })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{maintenanceStatuses.map((status) => <SelectItem key={status} value={status}>{maintenanceStatusLabels[status]}</SelectItem>)}</SelectContent></Select></FormField><FormField error={form.formState.errors.cost?.message} htmlFor="transition-cost" label="التكلفة"><Input id="transition-cost" type="number" step="0.01" {...form.register("cost")} /></FormField><FormField error={form.formState.errors.execution_date?.message} htmlFor="transition-date" label="تاريخ التنفيذ"><Input id="transition-date" type="date" {...form.register("execution_date")} /></FormField></div><FormField error={form.formState.errors.note?.message} htmlFor="transition-note" label="ملاحظة"><Textarea id="transition-note" rows={3} {...form.register("note")} /></FormField>{form.formState.errors.root?.message ? <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p> : null}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button><Button isLoading={isLoading} type="submit">تحديث الحالة</Button></div></form></DialogContent></Dialog>;
}

export function MaintenanceDetailsPage() {
  const { id } = useParams(); const navigate = useNavigate(); const requestId = id ? Number(id) : undefined;
  const requestQuery = useMaintenanceRequest(requestId); const historyQuery = useMaintenanceHistory(requestId); const { vendorsQuery } = useMaintenanceOptions();
  const { assignMutation, transitionMutation, deleteMutation } = useMaintenanceMutations();
  const relations = useMaintenanceRelations(requestQuery.data);
  const [assignOpen, setAssignOpen] = useState(false); const [transitionOpen, setTransitionOpen] = useState(false); const [deleteOpen, setDeleteOpen] = useState(false);
  if (requestQuery.isPending) return <LoadingState label="جاري تحميل البلاغ" />;
  if (requestQuery.isError || !requestQuery.data) return <ErrorState title="تعذر تحميل البلاغ" description="لم نتمكن من تحميل تفاصيل بلاغ الصيانة." onRetry={() => void requestQuery.refetch()} />;
  const request = requestQuery.data;
  return <motion.div {...pageMotion}><PageContainer><PageHeader eyebrow="الصيانة" title={`بلاغ #${request.id}`} description="تفاصيل البلاغ وإجراءات سير العمل المدعومة." actions={<div className="flex flex-wrap gap-2"><Can permission="maintenance.update"><Button asChild className="rounded-full" variant="outline"><Link to={`/maintenance/${request.id}/edit`}>تعديل</Link></Button><Button className="rounded-full" variant="outline" onClick={() => setAssignOpen(true)}>إسناد</Button><Button className="rounded-full" onClick={() => setTransitionOpen(true)}>تحديث الحالة</Button></Can><Can permission="maintenance.delete"><Button className="rounded-full" variant="destructive" onClick={() => setDeleteOpen(true)}>حذف</Button></Can></div>} />
    <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>بيانات البلاغ</CardTitle><MaintenanceStatusBadge status={request.status} /></div></CardHeader><CardContent><DetailGrid><DetailItem label="نوع البلاغ" value={request.issue_type} /><DetailItem label="العقار" value={relations.propertyQuery.data?.name ?? (request.property_id ? `#${request.property_id}` : null)} /><DetailItem label="الوحدة" value={relations.unitQuery.data?.unit_number ?? (request.unit_id ? `#${request.unit_id}` : null)} /><DetailItem label="المورد" value={relations.vendorQuery.data?.name ?? (request.vendor_id ? `#${request.vendor_id}` : null)} /><DetailItem label="التكلفة" value={formatCurrency(request.cost)} /><DetailItem label="تاريخ التنفيذ" value={request.execution_date ? formatDate(request.execution_date) : null} /></DetailGrid><div className="mt-4 flex flex-wrap gap-2">{request.priority ? <MaintenancePriorityBadge priority={request.priority} /> : null}</div>{request.description ? <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4"><p className="text-meta">الوصف</p><p className="mt-2 leading-7 text-foreground">{request.description}</p></div> : null}</CardContent></Card>
    <Card><CardHeader><CardTitle>سجل البلاغ</CardTitle></CardHeader><CardContent>{historyQuery.isError ? <ErrorState compact title="تعذر تحميل السجل" description="Endpoint السجل لم يرجع بيانات قابلة للعرض." /> : (historyQuery.data ?? []).length === 0 ? <EmptyState compact title="لا يوجد سجل" description="لم يرجع backend أحداثًا لهذا البلاغ." /> : <JsonPreview rows={historyQuery.data ?? []} emptyTitle="لا يوجد سجل" />}</CardContent></Card>
    <AssignDialog open={assignOpen} vendors={vendorsQuery.data ?? []} isLoading={assignMutation.isPending} onOpenChange={setAssignOpen} onSubmit={async (values) => { await assignMutation.mutateAsync({ id: request.id, payload: values }); }} />
    <TransitionDialog open={transitionOpen} isLoading={transitionMutation.isPending} onOpenChange={setTransitionOpen} onSubmit={async (values) => { await transitionMutation.mutateAsync({ id: request.id, payload: values }); }} />
    <ConfirmDialog open={deleteOpen} title="حذف بلاغ الصيانة" description="سيتم حذف البلاغ عبر DELETE /maintenance/{request_id}." confirmLabel="حذف البلاغ" isLoading={deleteMutation.isPending} onOpenChange={setDeleteOpen} onConfirm={() => void deleteMutation.mutateAsync(request.id).then(() => navigate("/maintenance"))} />
  </PageContainer></motion.div>;
}




