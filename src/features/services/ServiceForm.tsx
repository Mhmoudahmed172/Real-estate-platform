import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FormField } from "@/components/forms/FormField";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { serviceCreateSchema, serviceUpdateSchema, type ServiceCreateValues, type ServiceUpdateValues } from "@/features/services/serviceSchema";
import { applyApiFieldErrors } from "@/lib/formErrors";
import type { SelectOption } from "@/types/api";
import type { ServiceCreate, ServiceOut, ServiceUpdate } from "@/types/resources";

type Values = ServiceCreateValues & ServiceUpdateValues;

type ServiceFormProps = { mode: "create" | "edit"; service?: ServiceOut; properties: SelectOption[]; vendors: SelectOption[]; onSubmit: (payload: ServiceCreate | ServiceUpdate) => Promise<void>; onCancelHref: string };

function defaults(service?: ServiceOut): Values {
  return { property_id: service?.property_id ?? 0, service_name: service?.service_name ?? "", provider_id: service?.provider_id ?? null, cost: service?.cost ?? null, due_date: service?.due_date ?? "" };
}

export function ServiceForm({ mode, service, properties, vendors, onSubmit, onCancelHref }: ServiceFormProps) {
  const form = useForm<Values>({ resolver: zodResolver(mode === "create" ? serviceCreateSchema : serviceUpdateSchema), defaultValues: defaults(service) });
  const formErrors = form.formState.errors as Record<string, { message?: string } | undefined>;
  const errorFor = (name: string) => formErrors[name]?.message;
  async function handleSubmit(values: Values) {
    try {
      if (mode === "create") await onSubmit({ property_id: values.property_id, service_name: values.service_name, provider_id: values.provider_id, cost: values.cost, due_date: values.due_date || null });
      else await onSubmit({ service_name: values.service_name, provider_id: values.provider_id, cost: values.cost, due_date: values.due_date || null });
    } catch (error) {
      const apiError = applyApiFieldErrors(error, form.setError);
      form.setError("root", { message: apiError.message });
    }
  }
  return <form className="space-y-5" onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}>
    <FormSection title="بيانات الخدمة" description="اربط الخدمة بعقار، ويمكن إسنادها إلى مورد عند الحاجة."><div className="grid gap-4 md:grid-cols-2">{mode === "create" ? <FormField error={errorFor("property_id")} label="العقار" required><Select value={form.watch("property_id") ? String(form.watch("property_id")) : ""} onValueChange={(value) => form.setValue("property_id", Number(value), { shouldValidate: true })}><SelectTrigger><SelectValue placeholder="اختر العقار" /></SelectTrigger><SelectContent>{properties.map((property) => <SelectItem key={property.id} value={String(property.id)}>{property.label}</SelectItem>)}</SelectContent></Select></FormField> : null}<FormField error={errorFor("service_name")} htmlFor="service-name" label="اسم الخدمة" required><Input id="service-name" {...form.register("service_name")} /></FormField><FormField error={errorFor("provider_id")} label="المورد"><Select value={form.watch("provider_id") ? String(form.watch("provider_id")) : "none"} onValueChange={(value) => form.setValue("provider_id", value === "none" ? null : Number(value), { shouldValidate: true })}><SelectTrigger><SelectValue placeholder="بدون مورد" /></SelectTrigger><SelectContent><SelectItem value="none">بدون مورد</SelectItem>{vendors.map((vendor) => <SelectItem key={vendor.id} value={String(vendor.id)}>{vendor.label}</SelectItem>)}</SelectContent></Select></FormField><FormField error={errorFor("cost")} htmlFor="service-cost" label="التكلفة"><Input id="service-cost" type="number" step="0.01" {...form.register("cost")} /></FormField><FormField error={errorFor("due_date")} htmlFor="service-due" label="تاريخ الاستحقاق"><Input id="service-due" type="date" {...form.register("due_date")} /></FormField></div></FormSection>
    {form.formState.errors.root?.message ? <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p> : null}
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-5"><Button asChild className="rounded-full" type="button" variant="outline"><Link to={onCancelHref}>إلغاء</Link></Button><Button className="rounded-full px-6" isLoading={form.formState.isSubmitting} type="submit">{mode === "create" ? "حفظ الخدمة" : "حفظ التعديلات"}</Button></div>
  </form>;
}
