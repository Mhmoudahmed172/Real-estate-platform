import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FormField } from "@/components/forms/FormField";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { unitFormSchema, type UnitFormValues } from "@/features/units/unitSchema";
import { applyApiFieldErrors } from "@/lib/formErrors";
import { unitStatusLabels } from "@/lib/labels";
import type { SelectOption } from "@/types/api";
import { unitStatuses, type UnitCreate, type UnitOut, type UnitUpdate } from "@/types/resources";

type UnitFormProps = {
  mode: "create" | "edit";
  defaultUnit?: UnitOut;
  properties: SelectOption[];
  onSubmit: (payload: UnitCreate & { status?: UnitUpdate["status"] }) => Promise<void>;
  onCancelHref?: string;
};

function toFormValues(unit?: UnitOut): UnitFormValues {
  return {
    unit_number: unit?.unit_number ?? "",
    unit_type: unit?.unit_type ?? "",
    area: unit?.area ?? null,
    rooms_count: unit?.rooms_count ?? null,
    floor: unit?.floor ?? null,
    rent_value: unit?.rent_value ?? 0,
    property_id: unit?.property_id ?? 0,
    status: unit?.status ?? null,
  };
}

export function UnitForm({ mode, defaultUnit, properties, onSubmit, onCancelHref }: UnitFormProps) {
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: toFormValues(defaultUnit),
  });

  async function handleSubmit(values: UnitFormValues) {
    try {
      await onSubmit({
        unit_number: values.unit_number,
        unit_type: values.unit_type,
        area: values.area,
        rooms_count: values.rooms_count,
        floor: values.floor,
        rent_value: values.rent_value,
        property_id: values.property_id,
        status: mode === "edit" ? values.status : undefined,
      });
    } catch (error) {
      const apiError = applyApiFieldErrors(error, form.setError);
      form.setError("root", { message: apiError.message });
    }
  }

  return (
    <form className="space-y-5" onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}>
      <FormSection description="أدخل رقم الوحدة واختر العقار المرتبط." title="البيانات الأساسية">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField error={form.formState.errors.unit_number?.message} htmlFor="unit-number" label="رقم الوحدة" required>
            <Input id="unit-number" {...form.register("unit_number")} />
          </FormField>
          <FormField error={form.formState.errors.property_id?.message} label="العقار" required>
            <Select
              value={form.watch("property_id") ? String(form.watch("property_id")) : undefined}
              onValueChange={(value) => form.setValue("property_id", Number(value), { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر العقار" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={String(property.id)}>
                    {property.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </FormSection>

      <FormSection description="أدخل نوع الوحدة والدور والمساحة وعدد الغرف." title="مواصفات الوحدة">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField error={form.formState.errors.unit_type?.message} htmlFor="unit-type" label="نوع الوحدة">
            <Input id="unit-type" {...form.register("unit_type")} />
          </FormField>
          <FormField error={form.formState.errors.floor?.message} htmlFor="unit-floor" label="الدور">
            <Input id="unit-floor" inputMode="numeric" type="number" {...form.register("floor")} />
          </FormField>
          <FormField error={form.formState.errors.rooms_count?.message} htmlFor="unit-rooms" label="عدد الغرف">
            <Input id="unit-rooms" inputMode="numeric" type="number" {...form.register("rooms_count")} />
          </FormField>
          <FormField error={form.formState.errors.area?.message} htmlFor="unit-area" label="المساحة">
            <Input id="unit-area" inputMode="decimal" step="0.01" type="number" {...form.register("area")} />
          </FormField>
        </div>
      </FormSection>

      <FormSection description="أدخل قيمة الإيجار وحالة الوحدة." title="التشغيل والإيجار">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField error={form.formState.errors.rent_value?.message} htmlFor="unit-rent" label="قيمة الإيجار" required>
            <Input id="unit-rent" inputMode="decimal" step="0.01" type="number" {...form.register("rent_value")} />
          </FormField>
          {mode === "edit" ? (
            <FormField error={form.formState.errors.status?.message} label="الحالة">
              <Select
                value={form.watch("status") ?? undefined}
                onValueChange={(value) => form.setValue("status", value as UnitFormValues["status"], { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {unitStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          ) : null}
        </div>
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
          {mode === "create" ? "حفظ الوحدة" : "حفظ التعديلات"}
        </Button>
      </div>
    </form>
  );
}
