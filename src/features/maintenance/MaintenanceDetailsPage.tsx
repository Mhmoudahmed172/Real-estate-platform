import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { normalizeApiError } from "@/api/errors";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { FormField } from "@/components/forms/FormField";
import { ActivityTimeline, type TimelineItem } from "@/components/layout/ActivityTimeline";
import { DetailGrid, DetailItem } from "@/components/layout/DetailGrid";
import { DetailHeader } from "@/components/layout/DetailHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ContactLink } from "@/components/ui/ContactLink";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { type ActionMenuItem } from "@/components/ui/ActionMenu";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { MaintenancePriorityBadge, MaintenanceStatusBadge } from "@/components/ui/StatusBadge";
import { Textarea } from "@/components/ui/Textarea";
import { useAuthorization } from "@/features/auth/useAuthorization";
import { maintenanceAssignSchema, maintenanceTransitionSchema, type MaintenanceAssignValues, type MaintenanceTransitionValues } from "@/features/maintenance/maintenanceSchema";
import { useMaintenanceMutations, useMaintenanceOptions, useMaintenanceRelations, useMaintenanceRequest, useMaintenanceTimeline } from "@/features/maintenance/useMaintenance";
import { applyApiFieldErrors } from "@/lib/formErrors";
import { formatDisplayText, relationLabel } from "@/lib/display";
import { AuditLogSection } from "@/components/layout/AuditLogSection";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { actorMeta, formatMaintenanceEvent } from "@/lib/operationalLabels";
import { maintenanceStatusLabels } from "@/lib/labels";
import { pageMotion } from "@/lib/motion";
import type { SelectOption } from "@/types/api";
import { maintenanceStatuses } from "@/types/resources";

type AssignDialogProps = {
  open: boolean;
  vendors: SelectOption[];
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MaintenanceAssignValues) => Promise<void>;
};

function AssignDialog({ open, vendors, isLoading, onOpenChange, onSubmit }: AssignDialogProps) {
  const form = useForm<MaintenanceAssignValues>({ resolver: zodResolver(maintenanceAssignSchema), defaultValues: { vendor_id: 0 } });
  async function submit(values: MaintenanceAssignValues) {
    try {
      await onSubmit(values);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      const apiError = applyApiFieldErrors(error, form.setError);
      form.setError("root", { message: apiError.message });
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إسناد البلاغ</DialogTitle>
          <DialogDescription>اختر المورد الذي سيتولى تنفيذ البلاغ.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(event) => void form.handleSubmit(submit)(event)}>
          <FormField error={form.formState.errors.vendor_id?.message} label="المورد" required>
            <Select value={form.watch("vendor_id") ? String(form.watch("vendor_id")) : ""} onValueChange={(value) => form.setValue("vendor_id", Number(value), { shouldValidate: true })}>
              <SelectTrigger><SelectValue placeholder="اختر المورد" /></SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={String(vendor.id)}>{vendor.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          {form.formState.errors.root?.message ? (
            <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button isLoading={isLoading} type="submit">إسناد</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TransitionDialog({
  open,
  isLoading,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MaintenanceTransitionValues) => Promise<void>;
}) {
  const form = useForm<MaintenanceTransitionValues>({
    resolver: zodResolver(maintenanceTransitionSchema),
    defaultValues: { status: "InProgress", note: "", cost: null, execution_date: "" },
  });
  async function submit(values: MaintenanceTransitionValues) {
    try {
      await onSubmit(values);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      const apiError = applyApiFieldErrors(error, form.setError);
      form.setError("root", { message: apiError.message });
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تحديث حالة البلاغ</DialogTitle>
          <DialogDescription>حدّث حالة البلاغ وتكلفة التنفيذ عند الحاجة.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(event) => void form.handleSubmit(submit)(event)}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={form.formState.errors.status?.message} label="الحالة" required>
              <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as MaintenanceTransitionValues["status"], { shouldValidate: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {maintenanceStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{maintenanceStatusLabels[status]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField error={form.formState.errors.cost?.message} htmlFor="transition-cost" label="التكلفة">
              <Input id="transition-cost" step="0.01" type="number" {...form.register("cost")} />
            </FormField>
            <FormField error={form.formState.errors.execution_date?.message} htmlFor="transition-date" label="تاريخ التنفيذ">
              <Input id="transition-date" type="date" {...form.register("execution_date")} />
            </FormField>
          </div>
          <FormField error={form.formState.errors.note?.message} htmlFor="transition-note" label="ملاحظة">
            <Textarea id="transition-note" rows={3} {...form.register("note")} />
          </FormField>
          {form.formState.errors.root?.message ? (
            <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button isLoading={isLoading} type="submit">تحديث الحالة</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MaintenanceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuthorization();
  const requestId = id ? Number(id) : undefined;
  const requestQuery = useMaintenanceRequest(requestId);
  const timelineQuery = useMaintenanceTimeline(requestId);
  const { vendorsQuery } = useMaintenanceOptions();
  const { assignMutation, transitionMutation, deleteMutation } = useMaintenanceMutations();
  const relations = useMaintenanceRelations(requestQuery.data);
  const [assignOpen, setAssignOpen] = useState(false);
  const [transitionOpen, setTransitionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const timelineItems = useMemo<TimelineItem[]>(() => {
    return (timelineQuery.data ?? []).map((entry, index) => ({
      id: `${entry.event}-${entry.timestamp}-${index}`,
      title: formatMaintenanceEvent(entry.event),
      description: typeof entry.meta?.note === "string" ? formatDisplayText(entry.meta.note) : null,
      meta: actorMeta(entry.actor_name),
      timestamp: formatDateTime(entry.timestamp),
    }));
  }, [timelineQuery.data]);

  if (requestQuery.isPending) return <LoadingState label="جاري تحميل البلاغ" />;
  if (requestQuery.isError || !requestQuery.data) {
    return <ErrorState description="لم نتمكن من تحميل تفاصيل بلاغ الصيانة." title="تعذر تحميل البلاغ" onRetry={() => void requestQuery.refetch()} />;
  }
  const request = requestQuery.data;
  const vendor = relations.vendorQuery.data;
  const description = formatDisplayText(request.description);

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(request.id);
      navigate("/maintenance");
    } catch (error) {
      setDeleteError(normalizeApiError(error).message);
    }
  }

  return (
    <motion.div {...pageMotion}>
      <PageContainer>
        <DetailHeader
          backLabel="العودة إلى الصيانة"
          backTo="/maintenance"
          badges={
            <>
              <MaintenanceStatusBadge status={request.status} />
              {request.priority ? <MaintenancePriorityBadge priority={request.priority} /> : null}
            </>
          }
          description={relationLabel(relations.propertyQuery.data?.name, "property")}
          eyebrow="الصيانة"
          menuItems={[
            ...(can("maintenance.update")
              ? [
                  { id: "assign", label: "إسناد", onSelect: () => setAssignOpen(true) },
                  { id: "transition", label: "تحديث الحالة", onSelect: () => setTransitionOpen(true) },
                  { id: "edit", label: "تعديل", href: `/maintenance/${request.id}/edit` },
                ]
              : []),
            ...(can("maintenance.delete")
              ? [{ id: "delete", label: "حذف", destructive: true, onSelect: () => setDeleteOpen(true) }]
              : []),
          ] satisfies ActionMenuItem[]}
          primaryAction={
            can("maintenance.update")
              ? !request.vendor_id
                ? <Button className="rounded-full" onClick={() => setAssignOpen(true)}>إسناد</Button>
                : request.status !== "Completed" && request.status !== "Cancelled"
                  ? <Button className="rounded-full" onClick={() => setTransitionOpen(true)}>تحديث الحالة</Button>
                  : <Button asChild className="rounded-full" variant="outline"><Link to={`/maintenance/${request.id}/edit`}>تعديل</Link></Button>
              : null
          }
          title={request.issue_type}
        />
        <Card>
          <CardHeader>
            <CardTitle>بيانات البلاغ</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailGrid>
              <DetailItem label="نوع الصيانة" value={request.issue_type} />
              <DetailItem label="العقار" value={request.property_id ? relationLabel(relations.propertyQuery.data?.name, "property") : "بدون عقار"} />
              <DetailItem label="الوحدة" value={request.unit_id ? relationLabel(relations.unitQuery.data?.unit_number, "unit") : "بدون وحدة"} />
              <DetailItem label="المورد" value={request.vendor_id ? relationLabel(vendor?.name, "vendor") : "غير مسند"} />
              <DetailItem label="هاتف المورد" value={vendor?.phone ? <ContactLink type="phone" value={vendor.phone} /> : "—"} />
              <DetailItem label="التكلفة" value={formatCurrency(request.cost)} />
              <DetailItem label="تاريخ الإنشاء" value={request.created_at ? formatDateTime(request.created_at) : "—"} />
              <DetailItem label="تاريخ التنفيذ" value={request.execution_date ? formatDate(request.execution_date) : null} />
              <DetailItem label="الإكمال" value={request.status === "Completed" ? (request.execution_date ? `اكتمل في ${formatDate(request.execution_date)}` : "مكتمل") : "لم يكتمل بعد"} />
            </DetailGrid>
            {description ? (
              <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-meta">الوصف</p>
                <p className="mt-2 leading-7 text-foreground">{description}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>سجل البلاغ</CardTitle>
          </CardHeader>
          <CardContent>
            {timelineQuery.isError ? (
              <ErrorState compact description="تعذر تحميل سجل هذا البلاغ." title="تعذر تحميل السجل" />
            ) : (
              <ActivityTimeline emptyDescription="لم تُسجَّل أحداث على هذا البلاغ بعد." emptyTitle="لا يوجد سجل" items={timelineItems} />
            )}
          </CardContent>
        </Card>
        <AuditLogSection entityId={request.id} entityType="maintenance" />
        <AssignDialog
          isLoading={assignMutation.isPending}
          open={assignOpen}
          vendors={vendorsQuery.data ?? []}
          onOpenChange={setAssignOpen}
          onSubmit={async (values) => {
            await assignMutation.mutateAsync({ id: request.id, payload: values });
          }}
        />
        <TransitionDialog
          isLoading={transitionMutation.isPending}
          open={transitionOpen}
          onOpenChange={setTransitionOpen}
          onSubmit={async (values) => {
            await transitionMutation.mutateAsync({ id: request.id, payload: values });
          }}
        />
        <ConfirmDialog
          confirmLabel="حذف البلاغ"
          description={deleteError ?? `هل أنت متأكد من حذف البلاغ «${request.issue_type}»؟`}
          isLoading={deleteMutation.isPending}
          open={deleteOpen}
          title="حذف بلاغ الصيانة"
          onConfirm={() => void handleDelete()}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) setDeleteError(null);
          }}
        />
      </PageContainer>
    </motion.div>
  );
}
