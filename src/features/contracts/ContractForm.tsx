import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { propertiesApi } from "@/api/properties.api";
import { FormField } from "@/components/forms/FormField";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { contractFormSchema, contractUpdateSchema, type ContractFormValues, type ContractUpdateValues } from "@/features/contracts/contractSchema";
import { useUnitsForProperty } from "@/features/contracts/useContracts";
import { applyApiFieldErrors } from "@/lib/formErrors";
import { formatCurrency, parseMoney } from "@/lib/format";
import { contractStatusLabels, paymentFrequencyLabels } from "@/lib/labels";
import { queryKeys } from "@/lib/queryKeys";
import type { SelectOption } from "@/types/api";
import { contractStatuses, paymentFrequencies, type ContractCreate, type ContractOut, type ContractUpdate } from "@/types/resources";

export type SchedulePreviewHandler = (payload: ContractCreate) => Promise<void>;

type ContractFormProps = {
  mode: "create" | "edit";
  contract?: ContractOut;
  properties: SelectOption[];
  owners: SelectOption[];
  tenants: SelectOption[];
  onSubmit: (payload: ContractCreate | ContractUpdate) => Promise<void>;
  onPreview?: SchedulePreviewHandler;
  previewLoading?: boolean;
  onCancelHref: string;
  initialPropertyId?: number;
  initialUnitId?: number;
};

type Values = ContractFormValues | ContractUpdateValues;

function toCreateValues(contract?: ContractOut, initial?: { propertyId?: number; unitId?: number }): ContractFormValues {
  return {
    property_id: contract?.property_id ?? initial?.propertyId ?? 0,
    unit_id: contract?.unit_id ?? initial?.unitId ?? 0,
    owner_id: contract?.owner_id ?? 0,
    tenant_id: contract?.tenant_id ?? 0,
    start_date: contract?.start_date ?? "",
    end_date: contract?.end_date ?? "",
    rent_value: parseMoney(contract?.rent_value) ?? 0,
    payment_frequency: contract?.payment_frequency ?? "Monthly",
    deposit_amount: parseMoney(contract?.deposit_amount) ?? 0,
    terms: contract?.terms ?? "",
  };
}

function toUpdateValues(contract?: ContractOut): ContractUpdateValues {
  return {
    end_date: contract?.end_date ?? "",
    rent_value: parseMoney(contract?.rent_value) ?? 0,
    status: contract?.status ?? "Active",
    terms: contract?.terms ?? "",
  };
}

export function ContractForm({ mode, contract, properties, owners, tenants, onSubmit, onPreview, previewLoading, onCancelHref, initialPropertyId, initialUnitId }: ContractFormProps) {
  const form = useForm<Values>({
    resolver: zodResolver(mode === "create" ? contractFormSchema : contractUpdateSchema),
    defaultValues: mode === "create" ? toCreateValues(contract, { propertyId: initialPropertyId, unitId: initialUnitId }) : toUpdateValues(contract),
  });
  const selectedPropertyId = mode === "create" ? Number(form.watch("property_id")) || null : contract?.property_id;
  const unitsQuery = useUnitsForProperty(selectedPropertyId, mode === "create" ? { availableForContract: true } : undefined);
  const propertyQuery = useQuery({
    queryKey: queryKeys.properties.detail(selectedPropertyId ?? "unknown"),
    queryFn: () => propertiesApi.get(selectedPropertyId as number),
    enabled: mode === "create" && typeof selectedPropertyId === "number",
  });
  const unitOptions = useMemo(() => unitsQuery.data ?? [], [unitsQuery.data]);
  const propertyOwnerId = propertyQuery.data?.owner_id ?? null;
  const propertyOwnerName = owners.find((owner) => owner.id === propertyOwnerId)?.label;

  useEffect(() => {
    if (mode !== "create" || !propertyOwnerId) return;
    form.setValue("owner_id", propertyOwnerId, { shouldValidate: true });
  }, [form, mode, propertyOwnerId]);
  const formErrors = form.formState.errors as Record<string, { message?: string } | undefined>;
  const errorFor = (name: string) => formErrors[name]?.message;
  const watchString = (name: string) => String(form.watch(name as never) ?? "");

  function buildCreatePayload(values: Values): ContractCreate {
    const createValues = values as ContractFormValues;
    return {
      property_id: createValues.property_id,
      unit_id: createValues.unit_id,
      owner_id: createValues.owner_id || propertyOwnerId || undefined,
      tenant_id: createValues.tenant_id,
      start_date: createValues.start_date,
      end_date: createValues.end_date,
      rent_value: createValues.rent_value,
      payment_frequency: createValues.payment_frequency,
      deposit_amount: createValues.deposit_amount ?? 0,
      terms: createValues.terms || null,
    };
  }

  async function handleSubmit(values: Values) {
    try {
      if (mode === "create") await onSubmit(buildCreatePayload(values));
      else {
        const updateValues = values as ContractUpdateValues;
        await onSubmit({ end_date: updateValues.end_date, rent_value: updateValues.rent_value, status: updateValues.status, terms: updateValues.terms || null });
      }
    } catch (error) {
      const apiError = applyApiFieldErrors(error, form.setError);
      form.setError("root", { message: apiError.message });
    }
  }

  async function handlePreview() {
    if (!onPreview || mode !== "create") return;
    const valid = await form.trigger();
    if (!valid) return;
    try {
      await onPreview(buildCreatePayload(form.getValues()));
    } catch (error) {
      const apiError = applyApiFieldErrors(error, form.setError);
      form.setError("root", { message: apiError.message });
    }
  }

  return (
    <form className="space-y-5" onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}>
      {mode === "create" ? (
        <FormSection description="اختر العقار والوحدة والمالك والمستأجر." title="الأطراف والوحدة">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={errorFor("property_id")} label="العقار" required>
              <Select value={form.watch("property_id") ? String(form.watch("property_id")) : ""} onValueChange={(value) => { form.setValue("property_id", Number(value), { shouldValidate: true }); form.setValue("unit_id", 0, { shouldValidate: true }); }}>
                <SelectTrigger><SelectValue placeholder="اختر العقار" /></SelectTrigger>
                <SelectContent>{properties.map((property) => <SelectItem key={property.id} value={String(property.id)}>{property.label}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            <FormField error={errorFor("unit_id")} label="الوحدة" required>
              <Select disabled={!selectedPropertyId || unitsQuery.isPending} value={form.watch("unit_id") ? String(form.watch("unit_id")) : ""} onValueChange={(value) => form.setValue("unit_id", Number(value), { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder={selectedPropertyId ? (unitOptions.length ? "اختر الوحدة" : "لا توجد وحدات متاحة للتعاقد") : "اختر العقار أولًا"} /></SelectTrigger>
                <SelectContent>{unitOptions.map((unit) => <SelectItem key={unit.id} value={String(unit.id)}>{unit.unit_number} · {formatCurrency(unit.rent_value)}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
            {propertyOwnerId ? (
              <FormField label="المالك">
                <Input disabled value={propertyOwnerName ?? "مالك العقار المرتبط"} />
              </FormField>
            ) : (
              <FormField error={errorFor("owner_id")} label="المالك" required>
                <Select value={form.watch("owner_id") ? String(form.watch("owner_id")) : ""} onValueChange={(value) => form.setValue("owner_id", Number(value), { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="اختر المالك" /></SelectTrigger>
                  <SelectContent>{owners.map((owner) => <SelectItem key={owner.id} value={String(owner.id)}>{owner.label}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
            )}
            <FormField error={errorFor("tenant_id")} label="المستأجر" required>
              <Select value={form.watch("tenant_id") ? String(form.watch("tenant_id")) : ""} onValueChange={(value) => form.setValue("tenant_id", Number(value), { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="اختر المستأجر" /></SelectTrigger>
                <SelectContent>{tenants.map((tenant) => <SelectItem key={tenant.id} value={String(tenant.id)}>{tenant.label}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
          </div>
        </FormSection>
      ) : null}

      <FormSection description="حدد مدة العقد وقيمة الإيجار ودورية الدفع." title="تفاصيل العقد">
        <div className="grid gap-4 md:grid-cols-2">
          {mode === "create" ? <FormField error={errorFor("start_date")} htmlFor="contract-start" label="تاريخ البداية" required><Input id="contract-start" type="date" {...form.register("start_date" as never)} /></FormField> : null}
          <FormField error={errorFor("end_date")} htmlFor="contract-end" label="تاريخ النهاية" required><Input id="contract-end" type="date" {...form.register("end_date" as never)} /></FormField>
          <FormField error={errorFor("rent_value")} htmlFor="contract-rent" label="قيمة الإيجار" required><Input id="contract-rent" inputMode="decimal" type="number" step="0.01" {...form.register("rent_value" as never)} /></FormField>
          {mode === "create" ? <FormField error={errorFor("deposit_amount")} htmlFor="contract-deposit" label="مبلغ التأمين"><Input id="contract-deposit" inputMode="decimal" type="number" step="0.01" {...form.register("deposit_amount" as never)} /></FormField> : null}
          {mode === "create" ? <FormField error={errorFor("payment_frequency")} label="دورية الدفع" required><Select value={watchString("payment_frequency") || "Monthly"} onValueChange={(value) => form.setValue("payment_frequency" as never, value as never, { shouldValidate: true })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{paymentFrequencies.map((frequency) => <SelectItem key={frequency} value={frequency}>{paymentFrequencyLabels[frequency]}</SelectItem>)}</SelectContent></Select></FormField> : null}
          {mode === "edit" ? <FormField error={errorFor("status")} label="الحالة"><Select value={watchString("status") || "Active"} onValueChange={(value) => form.setValue("status" as never, value as never, { shouldValidate: true })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{contractStatuses.map((status) => <SelectItem key={status} value={status}>{contractStatusLabels[status]}</SelectItem>)}</SelectContent></Select></FormField> : null}
        </div>
      </FormSection>

      <FormSection description="يمكنك إضافة شروط العقد إن وجدت." title="الشروط">
        <FormField error={errorFor("terms")} htmlFor="contract-terms" label="الشروط">
          <Textarea id="contract-terms" rows={4} {...form.register("terms" as never)} />
        </FormField>
      </FormSection>

      {form.formState.errors.root?.message ? <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs text-destructive">{form.formState.errors.root.message}</p> : null}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-5">
        <Button asChild className="rounded-full" type="button" variant="outline"><Link to={onCancelHref}>إلغاء</Link></Button>
        {mode === "create" && onPreview ? <Button className="rounded-full" isLoading={previewLoading} type="button" variant="outline" onClick={() => void handlePreview()}><Eye aria-hidden="true" className="size-4" /> معاينة الجدول</Button> : null}
        <Button className="rounded-full px-6" isLoading={form.formState.isSubmitting} type="submit">{mode === "create" ? "حفظ العقد" : "حفظ التعديلات"}</Button>
      </div>
    </form>
  );
}



