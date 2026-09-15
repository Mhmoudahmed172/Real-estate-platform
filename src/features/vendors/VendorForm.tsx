import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FormField } from "@/components/forms/FormField";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { vendorFormSchema, type VendorFormValues } from "@/features/vendors/vendorSchema";
import { applyApiFieldErrors } from "@/lib/formErrors";
import type { VendorCreate, VendorOut, VendorUpdate } from "@/types/resources";

type VendorFormProps = { mode: "create" | "edit"; vendor?: VendorOut; onSubmit: (payload: VendorCreate | VendorUpdate) => Promise<void>; onCancelHref: string };

function defaults(vendor?: VendorOut): VendorFormValues {
  return { name: vendor?.name ?? "", phone: vendor?.phone ?? "", email: vendor?.email ?? "", services_provided: vendor?.services_provided ?? "", notes: vendor?.notes ?? "" };
}

export function VendorForm({ mode, vendor, onSubmit, onCancelHref }: VendorFormProps) {
  const form = useForm<VendorFormValues>({ resolver: zodResolver(vendorFormSchema), defaultValues: defaults(vendor) });
  async function handleSubmit(values: VendorFormValues) {
    try { await onSubmit({ name: values.name, phone: values.phone || null, email: values.email || null, services_provided: values.services_provided || null, notes: values.notes || null }); }
    catch (error) { const apiError = applyApiFieldErrors(error, form.setError); form.setError("root", { message: apiError.message }); }
  }
  return <form className="space-y-5" onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}>
    <FormSection title="بيانات المورد" description="الاسم وبيانات التواصل والخدمات كما يدعمها مخطط Vendor."><div className="grid gap-4 md:grid-cols-2"><FormField error={form.formState.errors.name?.message} htmlFor="vendor-name" label="اسم المورد" required><Input id="vendor-name" {...form.register("name")} /></FormField><FormField error={form.formState.errors.phone?.message} htmlFor="vendor-phone" label="الهاتف"><Input id="vendor-phone" {...form.register("phone")} /></FormField><FormField error={form.formState.errors.email?.message} htmlFor="vendor-email" label="البريد الإلكتروني"><Input id="vendor-email" type="email" {...form.register("email")} /></FormField><FormField error={form.formState.errors.services_provided?.message} htmlFor="vendor-services" label="الخدمات المقدمة"><Input id="vendor-services" {...form.register("services_provided")} /></FormField></div></FormSection>
    <FormSection title="ملاحظات" description="ملاحظات داخلية اختيارية عن المورد."><FormField error={form.formState.errors.notes?.message} htmlFor="vendor-notes" label="ملاحظات"><Textarea id="vendor-notes" rows={4} {...form.register("notes")} /></FormField></FormSection>
    {form.formState.errors.root?.message ? <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p> : null}
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-5"><Button asChild className="rounded-full" type="button" variant="outline"><Link to={onCancelHref}>إلغاء</Link></Button><Button className="rounded-full px-6" isLoading={form.formState.isSubmitting} type="submit">{mode === "create" ? "حفظ المورد" : "حفظ التعديلات"}</Button></div>
  </form>;
}
