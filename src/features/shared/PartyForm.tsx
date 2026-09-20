import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { FormField } from "@/components/forms/FormField";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { applyApiFieldErrors } from "@/lib/formErrors";
import { partyFormSchema, type PartyFormValues } from "@/features/shared/partySchema";

type PartyFormPayload = {
  full_name: string;
  phone?: string | null;
  email?: string | null;
  national_id?: string | null;
  notes?: string | null;
};

type PartyFormProps = {
  kind: "owner" | "tenant";
  defaultValues?: PartyFormPayload;
  onSubmit: (payload: PartyFormPayload) => Promise<void>;
  onCancelHref?: string;
};

function toFormValues(values?: PartyFormPayload): PartyFormValues {
  return {
    full_name: values?.full_name ?? "",
    phone: values?.phone ?? "",
    email: values?.email ?? "",
    national_id: values?.national_id ?? "",
    notes: values?.notes ?? "",
  };
}

export function PartyForm({ kind, defaultValues, onSubmit, onCancelHref }: PartyFormProps) {
  const form = useForm<PartyFormValues>({
    resolver: zodResolver(partyFormSchema),
    defaultValues: toFormValues(defaultValues),
  });
  const noun = kind === "owner" ? "المالك" : "المستأجر";

  async function handleSubmit(values: PartyFormValues) {
    try {
      await onSubmit({
        full_name: values.full_name,
        phone: values.phone,
        email: values.email,
        national_id: values.national_id,
        notes: values.notes,
      });
    } catch (error) {
      const apiError = applyApiFieldErrors(error, form.setError);
      form.setError("root", { message: apiError.message });
    }
  }

  return (
    <form className="space-y-5" onSubmit={(event) => void form.handleSubmit(handleSubmit)(event)}>
      <FormSection description="أدخل الاسم ورقم الهوية." title="البيانات الأساسية">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField error={form.formState.errors.full_name?.message} htmlFor="party-full-name" label="الاسم الكامل" required>
            <Input id="party-full-name" {...form.register("full_name")} />
          </FormField>
          <FormField error={form.formState.errors.national_id?.message} htmlFor="party-national-id" label="رقم الهوية">
            <Input id="party-national-id" {...form.register("national_id")} />
          </FormField>
        </div>
      </FormSection>

      <FormSection description="أدخل رقم الهاتف والبريد الإلكتروني." title="بيانات التواصل">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField error={form.formState.errors.phone?.message} htmlFor="party-phone" label="الهاتف">
            <Input id="party-phone" inputMode="tel" {...form.register("phone")} />
          </FormField>
          <FormField error={form.formState.errors.email?.message} htmlFor="party-email" label="البريد الإلكتروني">
            <Input id="party-email" inputMode="email" type="email" {...form.register("email")} />
          </FormField>
        </div>
      </FormSection>

      <FormSection description="ملاحظات داخلية اختيارية تظهر في صفحة التفاصيل." title="ملاحظات">
        <FormField error={form.formState.errors.notes?.message} htmlFor="party-notes" label="ملاحظات">
          <Textarea id="party-notes" rows={4} {...form.register("notes")} />
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
          حفظ {noun}
        </Button>
      </div>
    </form>
  );
}
