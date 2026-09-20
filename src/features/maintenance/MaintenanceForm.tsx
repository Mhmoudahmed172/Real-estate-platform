import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FormField } from "@/components/forms/FormField";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { maintenanceCreateSchema, maintenanceUpdateSchema, type MaintenanceCreateValues, type MaintenanceUpdateValues } from "@/features/maintenance/maintenanceSchema";
import { useUnitsForMaintenanceProperty } from "@/features/maintenance/useMaintenance";
import { applyApiFieldErrors } from "@/lib/formErrors";
import { formatCurrency } from "@/lib/format";
import { maintenancePriorityLabels, maintenanceStatusLabels } from "@/lib/labels";
import type { SelectOption } from "@/types/api";
import { maintenancePriorities, maintenanceStatuses, type MaintenanceCreate, type MaintenanceOut, type MaintenanceUpdate } from "@/types/resources";

type MaintenanceFormValues = MaintenanceCreateValues & MaintenanceUpdateValues;

type MaintenanceFormProps = {
  mode: "create" | "edit";
  request?: MaintenanceOut;
  properties: SelectOption[];
  vendors: SelectOption[];
  onSubmit: (payload: MaintenanceCreate | MaintenanceUpdate) => Promise<void>;
  onCancelHref: string;
};

function defaultValues(request?: MaintenanceOut): MaintenanceFormValues {
  return {
    property_id: request?.property_id ?? null,
    unit_id: request?.unit_id ?? null,
    issue_type: request?.issue_type ?? "",
    priority: request?.priority ?? "Medium",
    description: request?.description ?? "",
    vendor_id: request?.vendor_id ?? null,
    status: request?.status ?? "New",
    cost: request?.cost ?? null,
    execution_date: request?.execution_date ?? "",
  };
}

export function MaintenanceForm({ mode, request, properties, vendors, onSubmit, onCancelHref }: MaintenanceFormProps) {
  const form = useForm<MaintenanceFormValues>({ resolver: zodResolver(mode === "create" ? maintenanceCreateSchema : maintenanceUpdateSchema), defaultValues: defaultValues(request) });
  const propertyId = form.watch("property_id") ?? null;
  const unitsQuery = useUnitsForMaintenanceProperty(propertyId);
  const formErrors = form.formState.errors as Record<string, { message?: string } | undefined>;
  const errorFor = (name: string) => formErrors[name]?.message;

  async function handleSubmit(values: MaintenanceFormValues) {
    try {
      if (mode === "create") await onSubmit({ property_id: values.property_id, unit_id: values.unit_id, issue_type: values.issue_type, priority: values.priority, description: values.description || null, vendor_id: values.vendor_id });
      else await onSubmit({ priority: values.priority, description: values.description || null, vendor_id: values.vendor_id, status: values.status, cost: values.cost, execution_date: values.execution_date || null });
    } catch (error) {
      const apiError = applyApiFieldErrors(error, form.setError);
      form.setError("root", { message: apiError.message });
    }
  }

  return <form className="space-y-5" onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}>
    {mode === "create" ? <FormSection title="موقع البلاغ" description="العقار والوحدة اختياريان في OpenAPI، والوحدات تُحمّل حسب العقار المحدد."><div className="grid gap-4 md:grid-cols-2"><FormField error={errorFor("property_id")} label="العقار"><Select value={form.watch("property_id") ? String(form.watch("property_id")) : "none"} onValueChange={(value) => { form.setValue("property_id", value === "none" ? null : Number(value), { shouldValidate: true }); form.setValue("unit_id", null, { shouldValidate: true }); }}><SelectTrigger><SelectValue placeholder="بدون عقار" /></SelectTrigger><SelectContent><SelectItem value="none">بدون عقار</SelectItem>{properties.map((property) => <SelectItem key={property.id} value={String(property.id)}>{property.label}</SelectItem>)}</SelectContent></Select></FormField><FormField error={errorFor("unit_id")} label="الوحدة"><Select disabled={!propertyId || unitsQuery.isPending} value={form.watch("unit_id") ? String(form.watch("unit_id")) : "none"} onValueChange={(value) => form.setValue("unit_id", value === "none" ? null : Number(value), { shouldValidate: true })}><SelectTrigger><SelectValue placeholder="بدون وحدة" /></SelectTrigger><SelectContent><SelectItem value="none">بدون وحدة</SelectItem>{(unitsQuery.data ?? []).map((unit) => <SelectItem key={unit.id} value={String(unit.id)}>{unit.unit_number} · {formatCurrency(unit.rent_value)}</SelectItem>)}</SelectContent></Select></FormField></div></FormSection> : null}
    <FormSection title="بيانات البلاغ" description="الحقول التشغيلية المدعومة في مخطط الصيانة."><div className="grid gap-4 md:grid-cols-2">{mode === "create" ? <FormField error={errorFor("issue_type")} htmlFor="issue-type" label="نوع البلاغ" required><Input id="issue-type" {...form.register("issue_type")} /></FormField> : null}<FormField error={errorFor("priority")} label="الأولوية"><Select value={form.watch("priority") ?? "Medium"} onValueChange={(value) => form.setValue("priority", value as MaintenanceFormValues["priority"], { shouldValidate: true })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{maintenancePriorities.map((priority) => <SelectItem key={priority} value={priority}>{maintenancePriorityLabels[priority]}</SelectItem>)}</SelectContent></Select></FormField><FormField error={errorFor("vendor_id")} label="المورد"><Select value={form.watch("vendor_id") ? String(form.watch("vendor_id")) : "none"} onValueChange={(value) => form.setValue("vendor_id", value === "none" ? null : Number(value), { shouldValidate: true })}><SelectTrigger><SelectValue placeholder="بدون مورد" /></SelectTrigger><SelectContent><SelectItem value="none">بدون مورد</SelectItem>{vendors.map((vendor) => <SelectItem key={vendor.id} value={String(vendor.id)}>{vendor.label}</SelectItem>)}</SelectContent></Select></FormField>{mode === "edit" ? <><FormField error={errorFor("status")} label="الحالة"><Select value={form.watch("status") ?? "New"} onValueChange={(value) => form.setValue("status", value as MaintenanceFormValues["status"], { shouldValidate: true })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{maintenanceStatuses.map((status) => <SelectItem key={status} value={status}>{maintenanceStatusLabels[status]}</SelectItem>)}</SelectContent></Select></FormField><FormField error={errorFor("cost")} htmlFor="maintenance-cost" label="التكلفة"><Input id="maintenance-cost" type="number" step="0.01" {...form.register("cost")} /></FormField><FormField error={errorFor("execution_date")} htmlFor="execution-date" label="تاريخ التنفيذ"><Input id="execution-date" type="date" {...form.register("execution_date")} /></FormField></> : null}</div></FormSection>
    <FormSection title="الوصف" description="وصف البلاغ اختياري حسب OpenAPI."><FormField error={errorFor("description")} htmlFor="maintenance-description" label="الوصف"><Textarea id="maintenance-description" rows={4} {...form.register("description")} /></FormField></FormSection>
    {form.formState.errors.root?.message ? <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p> : null}
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-5"><Button asChild className="rounded-full" type="button" variant="outline"><Link to={onCancelHref}>إلغاء</Link></Button><Button className="rounded-full px-6" isLoading={form.formState.isSubmitting} type="submit">{mode === "create" ? "حفظ البلاغ" : "حفظ التعديلات"}</Button></div>
  </form>;
}
