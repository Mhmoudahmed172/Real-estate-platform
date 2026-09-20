import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FormField } from "@/components/forms/FormField";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { propertyFormSchema, type PropertyFormValues } from "@/features/properties/propertySchema";
import { applyApiFieldErrors } from "@/lib/formErrors";
import { propertyStatusLabels, propertyTypeLabels } from "@/lib/labels";
import type { SelectOption } from "@/types/api";
import { propertyStatuses, propertyTypes, type PropertyCreate, type PropertyOut } from "@/types/resources";

type PropertyFormProps = {
  mode: "create" | "edit";
  defaultProperty?: PropertyOut;
  owners: SelectOption[];
  onSubmit: (payload: PropertyCreate & { status?: PropertyOut["status"] | null }) => Promise<void>;
  onCancelHref?: string;
};

function toFormValues(property?: PropertyOut): PropertyFormValues {
  return {
    name: property?.name ?? "",
    property_type: property?.property_type ?? "Building",
    address: property?.address ?? "",
    city: property?.city ?? "",
    floors_count: property?.floors_count ?? null,
    owner_id: property?.owner_id ?? null,
    notes: property?.notes ?? "",
    status: property?.status ?? null,
  };
}

export function PropertyForm({ mode, defaultProperty, owners, onSubmit, onCancelHref }: PropertyFormProps) {
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: toFormValues(defaultProperty),
  });

  async function handleSubmit(values: PropertyFormValues) {
    try {
      await onSubmit({
        name: values.name,
        property_type: values.property_type,
        address: values.address,
        city: values.city,
        floors_count: values.floors_count,
        owner_id: values.owner_id,
        notes: values.notes,
        status: mode === "edit" ? values.status : undefined,
      });
    } catch (error) {
      const apiError = applyApiFieldErrors(error, form.setError);
      form.setError("root", { message: apiError.message });
    }
  }

  return (
    <form className="space-y-5" onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}>
      <FormSection description="اسم العقار ونوعه التشغيلي كما يعرّفهما عقد الإنشاء." title="البيانات الأساسية">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField error={form.formState.errors.name?.message} htmlFor="property-name" label="اسم العقار" required>
            <Input id="property-name" {...form.register("name")} />
          </FormField>
          <FormField error={form.formState.errors.property_type?.message} label="نوع العقار" required>
            <Select
              value={form.watch("property_type")}
              onValueChange={(value) => form.setValue("property_type", value as PropertyFormValues["property_type"], { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {propertyTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </FormSection>

      <FormSection description="المدينة والعنوان التشغيلي إن توفرا." title="الموقع">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField error={form.formState.errors.city?.message} htmlFor="property-city" label="المدينة">
            <Input id="property-city" {...form.register("city")} />
          </FormField>
          <FormField error={form.formState.errors.address?.message} htmlFor="property-address" label="العنوان">
            <Input id="property-address" {...form.register("address")} />
          </FormField>
        </div>
      </FormSection>

      <FormSection description="ربط المالك اختياري من قائمة الملاك المحمّلة." title="الملكية">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField error={form.formState.errors.owner_id?.message} label="المالك">
            <Select
              value={form.watch("owner_id") ? String(form.watch("owner_id")) : "none"}
              onValueChange={(value) =>
                form.setValue("owner_id", value === "none" ? null : Number(value), { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="بدون مالك" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">بدون مالك</SelectItem>
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={String(owner.id)}>
                    {owner.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </FormSection>

      <FormSection description="الإعدادات التشغيلية المتاحة في عقد العقار." title="إعدادات العقار">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField error={form.formState.errors.floors_count?.message} htmlFor="property-floors" label="عدد الأدوار">
            <Input id="property-floors" inputMode="numeric" type="number" {...form.register("floors_count")} />
          </FormField>
          {mode === "edit" ? (
            <FormField error={form.formState.errors.status?.message} label="الحالة">
              <Select
                value={form.watch("status") ?? undefined}
                onValueChange={(value) => form.setValue("status", value as PropertyFormValues["status"], { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propertyStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {propertyStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          ) : null}
        </div>
      </FormSection>

      <FormSection description="ملاحظات داخلية اختيارية تظهر في تفاصيل العقار." title="ملاحظات">
        <FormField error={form.formState.errors.notes?.message} htmlFor="property-notes" label="ملاحظات">
          <Textarea id="property-notes" rows={4} {...form.register("notes")} />
        </FormField>
      </FormSection>

      {form.formState.errors.root?.message ? (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {form.formState.errors.root.message}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-5">
        {onCancelHref ? (
          <Button asChild className="rounded-full" type="button" variant="outline">
            <Link to={onCancelHref}>إلغاء</Link>
          </Button>
        ) : null}
        <Button className="rounded-full px-6" isLoading={form.formState.isSubmitting} type="submit">
          {mode === "create" ? "حفظ العقار" : "حفظ التعديلات"}
        </Button>
      </div>
    </form>
  );
}
